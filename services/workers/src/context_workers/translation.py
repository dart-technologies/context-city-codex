from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Dict, Iterable, Iterator, List, MutableMapping, Optional, Protocol

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class TranslationItem:
    """Represents a single string that needs localization."""

    key: str
    text: str


class Translator(Protocol):
    """Common interface for translation providers."""

    def translate(
        self,
        items: Iterable[TranslationItem],
        target_locale: str,
        *,
        source_locale: str,
    ) -> Dict[str, str]: ...


def _iter_items(items: Iterable[TranslationItem]) -> Iterator[TranslationItem]:
    """Normalises items into a concrete iterator while filtering empty strings."""

    for item in items:
        if not item.text:
            continue
        yield item


class StaticTranslator:
    """Fallback translator that annotates strings with the target locale."""

    def translate(
        self,
        items: Iterable[TranslationItem],
        target_locale: str,
        *,
        source_locale: str,
    ) -> Dict[str, str]:
        base = source_locale.split('-')[0]
        target = target_locale.split('-')[0]
        results: Dict[str, str] = {}

        for item in _iter_items(items):
            if target == base:
                results[item.key] = item.text
            else:
                results[item.key] = f"[{target_locale}] {item.text}"
        return results


class GPTTranslator:
    """Calls a GPT-5 translation microservice to localise content."""

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

    def translate(
        self,
        items: Iterable[TranslationItem],
        target_locale: str,
        *,
        source_locale: str,
    ) -> Dict[str, str]:
        payload_items = [
            {'id': item.key, 'text': item.text}
            for item in _iter_items(items)
        ]
        if not payload_items:
            return {}

        attempt = 0
        while attempt < self.max_attempts:
            attempt += 1
            try:
                data = self._call_service(payload_items, source_locale, target_locale)
            except urllib.error.URLError as error:
                logger.warning('Translation request failed (attempt %s/%s): %s', attempt, self.max_attempts, error)
                if attempt >= self.max_attempts:
                    break
                continue

            translations = self._parse_response(data)
            if _is_complete_translation(payload_items, translations):
                return translations

            logger.warning(
                'Translation response missing entries (attempt %s/%s); retrying.',
                attempt,
                self.max_attempts,
            )

        return translations if 'translations' in locals() else {}

    def _call_service(
        self,
        payload_items: List[MutableMapping[str, str]],
        source_locale: str,
        target_locale: str,
    ) -> Dict[str, object]:
        request_payload = {
            'source_locale': source_locale,
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

    def _parse_response(self, data: Dict[str, object]) -> Dict[str, str]:
        translations_raw = data.get('translations', [])
        results: Dict[str, str] = {}
        if isinstance(translations_raw, list):
            for entry in translations_raw:
                if not isinstance(entry, dict):
                    continue
                key = entry.get('id')
                text = entry.get('text')
                if isinstance(key, str) and isinstance(text, str):
                    results[key] = text
        return results


def _is_complete_translation(
    payload_items: List[MutableMapping[str, str]],
    translations: Dict[str, str],
) -> bool:
    expected_keys = {entry['id'] for entry in payload_items}
    return expected_keys.issubset(translations.keys()) and all(translations.values())


def create_translator(provider: Optional[str] = None, options: Optional[Dict[str, object]] = None) -> Translator:
    """Factory that returns either the GPT-backed translator or the static fallback."""

    provider = (provider or 'auto').lower()
    options = options or {}

    if provider not in {'auto', 'static', 'gpt'}:
        raise ValueError(f'Unsupported translator provider: {provider}')

    if provider in {'auto', 'gpt'}:
        endpoint = options.get('endpoint') or os.environ.get('CODEX_TRANSLATION_ENDPOINT')
        api_key = options.get('api_key') or os.environ.get('CODEX_TRANSLATION_API_KEY')
        timeout = float(options.get('timeout', os.environ.get('CODEX_TRANSLATION_TIMEOUT', 12.0)))
        attempts = int(options.get('max_attempts', os.environ.get('CODEX_TRANSLATION_MAX_ATTEMPTS', 2)))

        if endpoint and api_key:
            return GPTTranslator(
                endpoint=str(endpoint),
                api_key=str(api_key),
                timeout_seconds=float(timeout),
                max_attempts=int(attempts),
            )

    return StaticTranslator()


__all__ = [
    'Translator',
    'TranslationItem',
    'StaticTranslator',
    'GPTTranslator',
    'create_translator',
]
