from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Dict, Iterable, Optional, Protocol

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class TTSRequestItem:
    """Represents a narration segment that needs synthesis."""

    id: str
    text: str


@dataclass
class TTSSynthesis:
    """Result of a TTS synthesis request."""

    locale: str
    audio_url: Optional[str] = None
    voice: Optional[str] = None
    segments: Dict[str, str] = field(default_factory=dict)


class TTSSynthesizer(Protocol):
    """Interface for text-to-speech providers."""

    def synthesize(
        self,
        items: Iterable[TTSRequestItem],
        *,
        locale: str,
        base_locale: str,
        poi_id: str,
    ) -> Optional[TTSSynthesis]: ...


class StaticTTSSynthesizer:
    """Fallback synthesizer when no TTS service is configured."""

    def synthesize(
        self,
        items: Iterable[TTSRequestItem],
        *,
        locale: str,
        base_locale: str,
        poi_id: str,
    ) -> Optional[TTSSynthesis]:
        return None


class GPTTTSSynthesizer:
    """Calls a GPT-5 TTS microservice to generate narration audio."""

    def __init__(
        self,
        endpoint: str,
        api_key: str,
        *,
        timeout_seconds: float = 15.0,
        max_attempts: int = 2,
        default_voice: Optional[str] = None,
        voice_overrides: Optional[Dict[str, str]] = None,
    ) -> None:
        self.endpoint = endpoint.rstrip('/')
        self.api_key = api_key
        self.timeout_seconds = timeout_seconds
        self.max_attempts = max(1, max_attempts)
        self.default_voice = default_voice
        self.voice_overrides = {k.lower(): v for k, v in (voice_overrides or {}).items()}

    def synthesize(
        self,
        items: Iterable[TTSRequestItem],
        *,
        locale: str,
        base_locale: str,
        poi_id: str,
    ) -> Optional[TTSSynthesis]:
        payload_items = [
            {'id': item.id, 'text': item.text}
            for item in items
            if item.text
        ]
        if not payload_items:
            return None

        voice = self._select_voice(locale)
        request_payload = {
            'poi_id': poi_id,
            'locale': locale,
            'base_locale': base_locale,
            'segments': payload_items,
        }
        if voice:
            request_payload['voice'] = voice

        attempt = 0
        while attempt < self.max_attempts:
            attempt += 1
            try:
                response_data = self._call_service(request_payload)
                return self._parse_response(locale, response_data, fallback_voice=voice)
            except urllib.error.URLError as error:
                logger.warning(
                    'TTS request failed (attempt %s/%s): %s',
                    attempt,
                    self.max_attempts,
                    error,
                )
        return None

    def _call_service(self, payload: Dict[str, object]) -> Dict[str, object]:
        request = urllib.request.Request(
            self.endpoint,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}',
            },
        )
        with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
            raw = response.read().decode('utf-8')
        return json.loads(raw)

    def _parse_response(
        self,
        locale: str,
        payload: Dict[str, object],
        *,
        fallback_voice: Optional[str] = None,
    ) -> Optional[TTSSynthesis]:
        audio_url = payload.get('audio_url')
        voice = payload.get('voice') or fallback_voice
        segments_raw = payload.get('segments')
        segments: Dict[str, str] = {}
        if isinstance(segments_raw, list):
            for entry in segments_raw:
                if not isinstance(entry, dict):
                    continue
                seg_id = entry.get('id')
                seg_text = entry.get('text')
                if isinstance(seg_id, str) and isinstance(seg_text, str) and seg_text:
                    segments[seg_id] = seg_text

        if isinstance(audio_url, str) and audio_url:
            return TTSSynthesis(locale=locale, audio_url=audio_url, voice=voice, segments=segments)

        logger.warning('TTS response missing audio_url for locale %s', locale)
        return None

    def _select_voice(self, locale: str) -> Optional[str]:
        candidates = [locale.lower(), locale.split('-')[0].lower()]
        for candidate in candidates:
            if candidate in self.voice_overrides:
                return self.voice_overrides[candidate]
        return self.default_voice


def _load_voice_overrides(options: Dict[str, object]) -> Dict[str, str]:
    overrides: Dict[str, str] = {}
    provided = options.get('voice_overrides')
    if isinstance(provided, dict):
        overrides.update({str(key).lower(): str(value) for key, value in provided.items() if value})
    env_map = os.environ.get('CODEX_TTS_VOICE_OVERRIDES')
    if env_map:
        try:
            parsed = json.loads(env_map)
            if isinstance(parsed, dict):
                overrides.update({str(key).lower(): str(value) for key, value in parsed.items() if value})
        except json.JSONDecodeError:
            logger.warning('Failed to parse CODEX_TTS_VOICE_OVERRIDES; expected JSON object')
    prefix = 'CODEX_TTS_VOICE_'
    for env_key, value in os.environ.items():
        if env_key.startswith(prefix) and value:
            locale_key = env_key[len(prefix):].replace('_', '-').lower()
            overrides.setdefault(locale_key, value)
    return overrides


def create_tts_synthesizer(
    provider: Optional[str] = None,
    options: Optional[Dict[str, object]] = None,
) -> Optional[TTSSynthesizer]:
    provider = (provider or 'auto').lower()
    options = options or {}

    if provider == 'none':
        return None

    if provider in {'auto', 'gpt'}:
        endpoint = options.get('endpoint') or os.environ.get('CODEX_TTS_ENDPOINT')
        api_key = options.get('api_key') or os.environ.get('CODEX_TTS_API_KEY')
        timeout = float(options.get('timeout', os.environ.get('CODEX_TTS_TIMEOUT', 15.0)))
        attempts = int(options.get('max_attempts', os.environ.get('CODEX_TTS_MAX_ATTEMPTS', 2)))
        default_voice = options.get('default_voice') or os.environ.get('CODEX_TTS_DEFAULT_VOICE')
        voice_overrides = _load_voice_overrides(options)

        if endpoint and api_key:
            return GPTTTSSynthesizer(
                endpoint=str(endpoint),
                api_key=str(api_key),
                timeout_seconds=float(timeout),
                max_attempts=int(attempts),
                default_voice=str(default_voice) if default_voice else None,
                voice_overrides=voice_overrides,
            )
        if provider == 'gpt':
            raise ValueError('TTS generator requires endpoint and api_key when provider is "gpt"')

    return StaticTTSSynthesizer()


__all__ = [
    'TTSRequestItem',
    'TTSSynthesis',
    'TTSSynthesizer',
    'StaticTTSSynthesizer',
    'GPTTTSSynthesizer',
    'create_tts_synthesizer',
]
