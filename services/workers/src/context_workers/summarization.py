from __future__ import annotations

import json
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Protocol


class Summarizer(Protocol):
    """Summarizer interface for transforming asset captions into highlight copy."""

    def summarize(self, captions: Iterable[str], locale: Optional[str] = None) -> str: ...


@dataclass
class StaticSummarizer:
    """Simple stub summarizer used for offline demos."""

    template: str = (
        "Codex blend of {count} moments: {captions}. Stay tuned for more guided whispers."
    )

    def summarize(self, captions: Iterable[str], locale: Optional[str] = None) -> str:
        captions_list = [caption for caption in captions if caption]
        if not captions_list:
            return "Codex is monitoring signals—more highlights soon."

        joined = '; '.join(captions_list[:3])
        return self.template.format(count=len(captions_list), captions=joined)


@dataclass
class ScreenAppSummarizer:
    """Example adapter for a ScreenApp-style summarization service."""

    endpoint: str
    api_key: str
    timeout_seconds: float = 5.0

    def summarize(self, captions: Iterable[str], locale: Optional[str] = None) -> str:
        payload: Dict[str, object] = {
            'captions': list(captions),
            'locale': locale or 'en',
        }
        req = urllib.request.Request(
            self.endpoint,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}',
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as response:
                data = json.loads(response.read().decode('utf-8'))
                return data.get('summary', '') or 'Codex summary unavailable.'
        except urllib.error.URLError as error:
            raise RuntimeError(f'Summarization request failed: {error}')


def create_summarizer(provider: str | None, options: Dict[str, object] | None = None) -> Summarizer:
    provider = (provider or 'static').lower()
    options = options or {}

    if provider == 'static':
        return StaticSummarizer(template=options.get('template', StaticSummarizer().template))

    if provider == 'screenapp':
        endpoint = options.get('endpoint')
        api_key = options.get('api_key')
        if not endpoint or not api_key:
            raise ValueError('ScreenApp summarizer requires endpoint and api_key')
        return ScreenAppSummarizer(endpoint=str(endpoint), api_key=str(api_key))

    raise ValueError(f'Unsupported summarizer provider: {provider}')
