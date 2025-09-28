from __future__ import annotations

import json
import logging
import os
import re
import urllib.error
import urllib.request
from collections import Counter
from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, List

LANGUAGE_KEYWORDS = {
    'es': [
        r'\bgracias\b',
        r'\bhol[ao]\b',
        r'\bprefer[io] español\b',
        r'\best[áa]s?\b',
        r'¡',
    ],
    'fr': [
        r'\bmerci\b',
        r'\bbonjour\b',
        r'\bfranç',
        r'\bparlons? fran',
    ],
    'en': [
        r'\bthanks\b',
        r'\bplease\b',
        r'\bhi\b',
    ],
}

ACCESSIBILITY_PATTERNS = {
    'captions': [
        r'caption',
        r'subtitle',
        r'closed caption',
        r'hard of hearing',
    ],
    'audio_description': [
        r'audio description',
        r'low vision',
        r'blind',
    ],
    'haptics': [
        r'haptic',
        r'vibration',
        r'sensory cue',
    ],
    'reduced_motion': [
        r'reduced motion',
        r'no animations',
        r'motion sickness',
    ],
}

logger = logging.getLogger(__name__)


@dataclass
class PreferenceResult:
    primary_locale: str
    secondary_locales: List[str] = field(default_factory=list)
    needs_captions: bool = False
    needs_audio_description: bool = False
    needs_haptics: bool = False
    needs_reduced_motion: bool = False
    notes: List[str] = field(default_factory=list)


TextIterable = Iterable[str]


def _gather_text(profile: Dict[str, Any]) -> List[str]:
    texts: List[str] = []

    settings = profile.get('settings') or {}
    for value in settings.values():
        if isinstance(value, str):
            texts.append(value)

    for signal in profile.get('signals', []):
        if isinstance(signal, dict):
            value = signal.get('value')
            if isinstance(value, str):
                texts.append(value)
            elif isinstance(value, (list, tuple)):
                texts.extend(str(item) for item in value)

    conversation = profile.get('conversation_history') or []
    for entry in conversation:
        if isinstance(entry, str):
            texts.append(entry)
        elif isinstance(entry, dict):
            content = entry.get('content')
            if isinstance(content, str):
                texts.append(content)

    return [text.lower() for text in texts]


def _score_locales(texts: TextIterable, profile: Dict[str, Any]) -> Counter[str]:
    scores: Counter[str] = Counter()

    declared = profile.get('preferred_locale') or profile.get('settings', {}).get('preferred_locale')
    if isinstance(declared, str):
        scores[declared.split('-')[0]] += 5

    for signal in profile.get('signals', []):
        if isinstance(signal, dict) and signal.get('type') == 'locale_hint':
            value = signal.get('value')
            if isinstance(value, str):
                scores[value.split('-')[0]] += 4

    for text in texts:
        for locale, patterns in LANGUAGE_KEYWORDS.items():
            matches = sum(1 for pattern in patterns if re.search(pattern, text))
            if matches:
                scores[locale] += matches

    if not scores:
        scores['en'] = 1
    return scores


def _detect_accessibility(texts: TextIterable) -> Dict[str, bool]:
    result = {
        'captions': False,
        'audio_description': False,
        'haptics': False,
        'reduced_motion': False,
    }

    for text in texts:
        for key, patterns in ACCESSIBILITY_PATTERNS.items():
            if any(re.search(pattern, text) for pattern in patterns):
                if key == 'captions':
                    result['captions'] = True
                elif key == 'audio_description':
                    result['audio_description'] = True
                elif key == 'haptics':
                    result['haptics'] = True
                elif key == 'reduced_motion':
                    result['reduced_motion'] = True
    return result


def detect_preferences(profile: Dict[str, Any]) -> PreferenceResult:
    """Infer locale and accessibility preferences from a Codex profile.

    When GPT-5 credentials are available, this function forwards the request to the
    preference microservice using the env vars `CODEX_PREFERENCES_ENDPOINT` and
    `CODEX_PREFERENCES_API_KEY`. If the call fails or is not configured, it falls back
    to the local heuristic used during early development, preserving the return
    contract for callers.
    """

    service_payload = _call_preference_service(profile)
    if service_payload is not None:
        return _coerce_service_payload(service_payload)

    return _detect_preferences_heuristic(profile)


def _detect_preferences_heuristic(profile: Dict[str, Any]) -> PreferenceResult:
    texts = _gather_text(profile)
    locale_scores = _score_locales(texts, profile)
    ranked = [locale for locale, _ in locale_scores.most_common()]
    primary = ranked[0]
    secondary = [loc for loc in ranked[1:]]

    accessibility = _detect_accessibility(texts)

    notes: List[str] = []
    if profile.get('notes'):
        notes.extend(str(n) for n in profile['notes'])

    if accessibility['captions']:
        notes.append('Prefers captions/subtitles based on conversation cues.')
    if accessibility['audio_description']:
        notes.append('Requests audio descriptions or low-vision support.')
    if accessibility['haptics']:
        notes.append('Wants haptic or tactile cues for key events.')
    if accessibility['reduced_motion']:
        notes.append('Sensitive to heavy motion; favor gentle transitions.')

    return PreferenceResult(
        primary_locale=primary,
        secondary_locales=secondary,
        needs_captions=accessibility['captions'],
        needs_audio_description=accessibility['audio_description'],
        needs_haptics=accessibility['haptics'],
        needs_reduced_motion=accessibility['reduced_motion'],
        notes=notes,
    )


def _call_preference_service(profile: Dict[str, Any]) -> Dict[str, Any] | None:
    endpoint = os.environ.get('CODEX_PREFERENCES_ENDPOINT')
    api_key = os.environ.get('CODEX_PREFERENCES_API_KEY')
    if not endpoint or not api_key:
        return None

    payload = json.dumps({'profile': profile}).encode('utf-8')
    request = urllib.request.Request(
        endpoint,
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        },
    )
    timeout = float(os.environ.get('CODEX_PREFERENCES_TIMEOUT', '6'))

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read().decode('utf-8')
    except urllib.error.URLError as error:
        logger.warning('Preference service request failed (%s); falling back to heuristic.', error)
        return None

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning('Preference service returned invalid JSON; falling back to heuristic.')
        return None

    return data


def _coerce_service_payload(payload: Dict[str, Any]) -> PreferenceResult:
    primary = str(payload.get('primary_locale') or 'en')
    secondary_raw = payload.get('secondary_locales') or []
    if not isinstance(secondary_raw, list):
        secondary_raw = []
    secondary = [str(locale) for locale in secondary_raw if locale]

    def _bool_field(key: str) -> bool:
        value = payload.get(key)
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.lower() in {'true', '1', 'yes'}
        if isinstance(value, (int, float)):
            return bool(value)
        return False

    notes_field = payload.get('notes') or []
    if isinstance(notes_field, list):
        notes = [str(note) for note in notes_field]
    elif isinstance(notes_field, str):
        notes = [notes_field]
    else:
        notes = []

    return PreferenceResult(
        primary_locale=primary,
        secondary_locales=secondary,
        needs_captions=_bool_field('needs_captions'),
        needs_audio_description=_bool_field('needs_audio_description'),
        needs_haptics=_bool_field('needs_haptics'),
        needs_reduced_motion=_bool_field('needs_reduced_motion'),
        notes=notes,
    )


__all__ = [
    'PreferenceResult',
    'detect_preferences',
]
