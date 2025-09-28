from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Protocol

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class AccessibilityFields:
    """Accessibility assets for a single highlight segment."""

    caption: str
    audio_description: str
    haptic_cue: str
    alt_text: str


@dataclass(frozen=True)
class AccessibilityItem:
    """Input payload describing a segment that needs accessibility assets."""

    id: str
    clip_title: str
    clip_summary: str
    caption: str
    rationale: str
    tags: List[str]
    locale: str
    base_locale: str


class AccessibilityGenerator(Protocol):
    """Common interface for accessibility asset generators."""

    def generate(
        self,
        items: Iterable[AccessibilityItem],
        *,
        target_locale: str,
    ) -> Dict[str, AccessibilityFields]: ...


class StaticAccessibilityGenerator:
    """Fallback heuristic for demos when GPT access is unavailable."""

    def generate(
        self,
        items: Iterable[AccessibilityItem],
        *,
        target_locale: str,
    ) -> Dict[str, AccessibilityFields]:
        assets: Dict[str, AccessibilityFields] = {}
        for item in items:
            caption = item.caption or item.clip_summary
            audio_desc = (
                f"Audio description ({target_locale}): {item.clip_title} — {item.clip_summary or caption}."
            )
            haptic_cue = _infer_haptic_cue(item.tags)
            alt_text = item.clip_summary or caption
            assets[item.id] = AccessibilityFields(
                caption=caption,
                audio_description=audio_desc,
                haptic_cue=haptic_cue,
                alt_text=alt_text,
            )
        return assets


class GPTAccessibilityGenerator:
    """Calls a GPT-5 endpoint to author accessibility narration and cues."""

    def __init__(
        self,
        endpoint: str,
        api_key: str,
        *,
        timeout_seconds: float = 12.0,
        max_attempts: int = 2,
    ) -> None:
        self.endpoint = endpoint.rstrip('/')
        self.api_key = api_key
        self.timeout_seconds = timeout_seconds
        self.max_attempts = max(1, max_attempts)

    def generate(
        self,
        items: Iterable[AccessibilityItem],
        *,
        target_locale: str,
    ) -> Dict[str, AccessibilityFields]:
        payload_items = [
            {
                'id': item.id,
                'clip_title': item.clip_title,
                'clip_summary': item.clip_summary,
                'caption': item.caption,
                'rationale': item.rationale,
                'tags': item.tags,
                'source_locale': item.base_locale,
                'target_locale': item.locale,
            }
            for item in items
        ]
        if not payload_items:
            return {}

        attempt = 0
        response_data: Optional[Dict[str, object]] = None
        while attempt < self.max_attempts:
            attempt += 1
            try:
                response_data = self._call_service(payload_items, target_locale)
                break
            except urllib.error.URLError as error:
                logger.warning(
                    'Accessibility request failed (attempt %s/%s): %s',
                    attempt,
                    self.max_attempts,
                    error,
                )

        if not response_data:
            return {}
        return self._parse_response(response_data)

    def _call_service(
        self,
        payload_items: List[Dict[str, object]],
        target_locale: str,
    ) -> Dict[str, object]:
        request_payload = {
            'target_locale': target_locale,
            'items': payload_items,
        }

        request = urllib.request.Request(
            self.endpoint,
            data=json.dumps(request_payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}',
            },
        )

        with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
            raw = response.read().decode('utf-8')
        return json.loads(raw)

    def _parse_response(self, payload: Dict[str, object]) -> Dict[str, AccessibilityFields]:
        results: Dict[str, AccessibilityFields] = {}
        entries = payload.get('items')
        if not isinstance(entries, list):
            return results

        for entry in entries:
            if not isinstance(entry, dict):
                continue
            item_id = entry.get('id')
            caption = entry.get('caption')
            audio_desc = entry.get('audio_description')
            haptic = entry.get('haptic_cue')
            alt_text = entry.get('alt_text')
            if not isinstance(item_id, str):
                continue
            if not all(isinstance(field, str) and field for field in [caption, audio_desc, haptic, alt_text]):
                continue
            results[item_id] = AccessibilityFields(
                caption=caption,
                audio_description=audio_desc,
                haptic_cue=haptic,
                alt_text=alt_text,
            )
        return results


def _infer_haptic_cue(tags: Iterable[str]) -> str:
    tag_set = {tag.lower() for tag in tags}
    if {'celebration', 'fans', 'goal', 'stadium'} & tag_set:
        return 'Three-quick pulses to mimic crowd energy.'
    if {'transit', 'travel', 'metro', 'train'} & tag_set:
        return 'Steady pulse signaling transit boarding.'
    if {'food', 'mercado', 'dining'} & tag_set:
        return 'Soft double tap to highlight tasting moment.'
    return 'Gentle single pulse for highlight focus.'


def create_accessibility_generator(
    provider: Optional[str] = None,
    options: Optional[Dict[str, object]] = None,
) -> AccessibilityGenerator:
    provider = (provider or 'auto').lower()
    options = options or {}

    if provider not in {'auto', 'static', 'gpt'}:
        raise ValueError(f'Unsupported accessibility generator: {provider}')

    if provider in {'auto', 'gpt'}:
        endpoint = options.get('endpoint') or os.environ.get('CODEX_ACCESSIBILITY_ENDPOINT')
        api_key = options.get('api_key') or os.environ.get('CODEX_ACCESSIBILITY_API_KEY')
        timeout = float(options.get('timeout', os.environ.get('CODEX_ACCESSIBILITY_TIMEOUT', 12.0)))
        attempts = int(options.get('max_attempts', os.environ.get('CODEX_ACCESSIBILITY_MAX_ATTEMPTS', 2)))

        if endpoint and api_key:
            return GPTAccessibilityGenerator(
                endpoint=str(endpoint),
                api_key=str(api_key),
                timeout_seconds=float(timeout),
                max_attempts=int(attempts),
            )

    return StaticAccessibilityGenerator()


__all__ = [
    'AccessibilityFields',
    'AccessibilityItem',
    'AccessibilityGenerator',
    'StaticAccessibilityGenerator',
    'GPTAccessibilityGenerator',
    'create_accessibility_generator',
]
