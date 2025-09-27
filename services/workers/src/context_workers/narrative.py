from __future__ import annotations

import json
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Protocol

from .models import Asset, NarrativeScript, ScriptBeat


class ScriptGenerator(Protocol):
    """Produces narrative scripts for highlight reels."""

    def generate(self, assets: Iterable[Asset], locale: Optional[str] = None) -> NarrativeScript: ...


@dataclass
class StaticScriptGenerator:
    """Offline three-beat script builder for demos."""

    beats: List[str] = None

    def __post_init__(self) -> None:
        if self.beats is None:
            self.beats = [
                'Arrival',
                'Main Event',
                'Celebration',
            ]

    def generate(self, assets: Iterable[Asset], locale: Optional[str] = None) -> NarrativeScript:
        assets = list(assets)
        captions = [asset.caption or asset.source.title() for asset in assets]
        locale = locale or 'en'
        script_beats: List[ScriptBeat] = []

        phrases = captions + [asset.source for asset in assets]
        for idx, title in enumerate(self.beats, start=1):
            clip = phrases[idx - 1] if idx - 1 < len(phrases) else phrases[-1]
            content = (
                f"{title}: Codex guides you through {clip}."
                " Expect curated transitions and trusted cues."
            )
            script_beats.append(ScriptBeat(id=f'beat-{idx}', title=title, content=content))

        provenance = {
            'generator': 'static',
            'captions_used': captions[: len(self.beats)],
        }
        return NarrativeScript(beats=script_beats, locale=locale, provenance=provenance)


@dataclass
class GPTScriptGenerator:
    """Calls a GPT-5 style endpoint to craft narratives."""

    endpoint: str
    api_key: str
    timeout_seconds: float = 8.0

    def generate(self, assets: Iterable[Asset], locale: Optional[str] = None) -> NarrativeScript:
        payload: Dict[str, object] = {
            'locale': locale or 'en',
            'prompts': [self._asset_prompt(asset) for asset in assets],
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
        except urllib.error.URLError as error:
            raise RuntimeError(f'GPT script request failed: {error}')

        beats_data = data.get('beats') or []
        script_beats = [
            ScriptBeat(id=beat.get('id', f'beat-{idx}'), title=beat.get('title', f'Beat {idx}'), content=beat.get('content', ''))
            for idx, beat in enumerate(beats_data, start=1)
        ]
        if not script_beats:
            raise RuntimeError('GPT script response did not include beats')

        provenance = data.get('provenance', {})
        provenance.setdefault('generator', 'gpt')

        return NarrativeScript(beats=script_beats, locale=payload['locale'], provenance=provenance)

    def _asset_prompt(self, asset: Asset) -> Dict[str, object]:
        return {
            'id': asset.id,
            'caption': asset.caption,
            'scenes': asset.scenes,
            'tags': asset.tags,
        }


def create_script_generator(provider: str | None, options: Optional[Dict[str, object]] = None) -> ScriptGenerator:
    provider = (provider or 'static').lower()
    options = options or {}

    if provider == 'static':
        beats = options.get('beats')
        return StaticScriptGenerator(beats=list(beats) if beats else None)

    if provider == 'gpt':
        endpoint = options.get('endpoint')
        api_key = options.get('api_key')
        if not endpoint or not api_key:
            raise ValueError('GPT script generator requires endpoint and api_key')
        return GPTScriptGenerator(endpoint=str(endpoint), api_key=str(api_key))

    raise ValueError(f'Unsupported script generator: {provider}')
