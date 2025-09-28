from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, Iterable, List, Optional
from urllib import error, request

from .models import Asset, HighlightFrame, HighlightNarrative


class CreatomateError(RuntimeError):
    """Raised when the Creatomate API responds with an error."""

    def __init__(self, message: str, status: int | None = None, details: Any | None = None) -> None:
        super().__init__(message)
        self.status = status
        self.details = details


@dataclass
class PoiContext:
    """Metadata describing the point of interest rendered in the reel."""

    id: str
    name: str
    locale: str = 'en'
    distance: Optional[str] = None
    hours: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class CreatomateRenderConfig:
    """Configuration for Creatomate render requests."""

    template_id: Optional[str]
    aspect_ratio: str = '9:16'
    output_format: str = 'mp4'
    clip_duration: float = 5.0
    transition_ms: int = 500
    brand_color: str = '#0b1221'
    accent_color: str = '#f5c333'
    default_music_track: Optional[str] = None
    webhook_url: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class StoryboardSegment:
    """Intermediate representation for each clip in the reel."""

    asset_id: str
    asset_url: str
    source: str
    tags: List[str]
    duration: float
    caption: Optional[str]
    script_title: Optional[str]
    script_content: Optional[str]
    frame: Optional[HighlightFrame]
    rationale: Optional[str]
    metrics: Dict[str, Any]
    subtitles: Dict[str, str] = field(default_factory=dict)


@dataclass
class Storyboard:
    poi: PoiContext
    narrative: HighlightNarrative
    segments: List[StoryboardSegment]

    def to_dict(self) -> Dict[str, Any]:
        return {
            'poi': {
                'id': self.poi.id,
                'name': self.poi.name,
                'locale': self.poi.locale,
                'distance': self.poi.distance,
                'hours': self.poi.hours,
                'tags': self.poi.tags,
                'metadata': self.poi.metadata,
            },
            'narrative': {
                'summary': self.narrative.summary,
                'language': self.narrative.language,
                'asset_ids': list(self.narrative.asset_ids),
                'rationale': list(self.narrative.rationale),
                'codexierge_locales': list(self.narrative.codexierge.keys()),
                'narrations': {
                    locale: asdict(narration)
                    for locale, narration in self.narrative.narrations.items()
                },
            },
            'segments': [
                {
                    'asset_id': segment.asset_id,
                    'asset_url': segment.asset_url,
                    'source': segment.source,
                    'tags': segment.tags,
                    'duration': segment.duration,
                    'caption': segment.caption,
                    'script_title': segment.script_title,
                    'script_content': segment.script_content,
                    'frame': asdict(segment.frame) if segment.frame else None,
                    'rationale': segment.rationale,
                    'metrics': segment.metrics,
                    'subtitles': segment.subtitles,
                }
                for segment in self.segments
            ],
        }


class CreatomateRenderer:
    """Builds Creatomate render payloads from highlight narratives."""

    def __init__(
        self,
        config: CreatomateRenderConfig,
        api_key: Optional[str] = None,
        *,
        base_url: str = 'https://api.creatomate.com/v2',
        timeout: float = 30.0,
    ) -> None:
        self.config = config
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout

    def build_storyboard(
        self,
        narrative: HighlightNarrative,
        assets: Iterable[Asset],
        poi: PoiContext,
    ) -> Storyboard:
        assets_by_id = {asset.id: asset for asset in assets}
        segments: List[StoryboardSegment] = []
        beats = list(narrative.script.beats) if narrative.script else []

        for index, asset_id in enumerate(narrative.asset_ids):
            asset = assets_by_id.get(asset_id)
            if not asset:
                continue

            frame = narrative.frames[index] if index < len(narrative.frames) else None
            script_title = beats[index].title if index < len(beats) else None
            script_content = beats[index].content if index < len(beats) else None
            rationale = narrative.rationale[index] if index < len(narrative.rationale) else None

            metrics = asdict(asset.metrics)
            metrics['engagement'] = asset.metrics.engagement

            segment = StoryboardSegment(
                asset_id=asset.id,
                asset_url=asset.url,
                source=asset.source,
                tags=list(asset.tags),
                duration=self.config.clip_duration,
                caption=(frame.caption if frame else asset.caption),
                script_title=script_title,
                script_content=script_content,
                frame=frame,
                rationale=rationale,
                metrics=metrics,
            )
            segments.append(segment)

        return Storyboard(poi=poi, narrative=narrative, segments=segments)

    def build_render_payload(self, storyboard: Storyboard) -> Dict[str, Any]:
        """Constructs the JSON payload expected by Creatomate's /renders endpoint."""

        modifications: List[Dict[str, Any]] = [
            {'name': 'poi_name', 'text': storyboard.poi.name},
            {'name': 'poi_distance', 'text': storyboard.poi.distance or ''},
            {'name': 'poi_hours', 'text': storyboard.poi.hours or ''},
            {'name': 'highlight_summary', 'text': storyboard.narrative.summary},
        ]

        if storyboard.poi.tags:
            modifications.append({'name': 'poi_tags', 'text': ' · '.join(storyboard.poi.tags)})

        for index, segment in enumerate(storyboard.segments, start=1):
            base_name = f'segment_{index}'
            if segment.asset_url:
                modifications.append({'name': f'{base_name}_media', 'src': segment.asset_url})
            elif segment.frame:
                modifications.append({'name': f'{base_name}_media', 'src': segment.frame.image_url})

            overlay_text = segment.caption or segment.script_content or ''
            modifications.append({'name': f'{base_name}_overlay', 'text': overlay_text})
            if segment.script_title:
                modifications.append({'name': f'{base_name}_title', 'text': segment.script_title})

        payload: Dict[str, Any] = {
            'template_id': self.config.template_id,
            'output_format': self.config.output_format,
            'modifications': modifications,
            'metadata': {
                'poi_id': storyboard.poi.id,
                'locale': storyboard.poi.locale,
                'asset_ids': [segment.asset_id for segment in storyboard.segments],
                'brand_color': self.config.brand_color,
                'accent_color': self.config.accent_color,
                **self.config.metadata,
            },
        }

        if self.config.webhook_url:
            payload['webhook_url'] = self.config.webhook_url

        if self.config.default_music_track:
            payload['modifications'].append({
                'name': 'soundtrack',
                'src': self.config.default_music_track,
            })

        # Provide sensible defaults for templates that model crossfade durations.
        payload['modifications'].append({
            'name': 'clip_duration_seconds',
            'text': str(self.config.clip_duration),
        })
        payload['modifications'].append({
            'name': 'transition_ms',
            'text': str(self.config.transition_ms),
        })

        return payload

    def create_manifest(self, storyboard: Storyboard, render_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Produces a machine-readable manifest for downstream analytics."""

        return {
            'provider': 'creatomate',
            'poi': storyboard.to_dict()['poi'],
            'narrative': storyboard.to_dict()['narrative'],
            'segments': storyboard.to_dict()['segments'],
            'render_payload': render_payload,
            'accessibility': {
                'captions': bool(render_payload.get('modifications')),
                'locales': [storyboard.narrative.language],
                'subtitle_locales': list(storyboard.narrative.narrations.keys()),
                'voice_locales': list(storyboard.narrative.narrations.keys()),
                'has_audio_description': False,
            },
            'provenance': storyboard.narrative.provenance,
        }

    def render(self, payload: Dict[str, Any], *, execute: bool = False) -> Dict[str, Any]:
        """Posts the payload to Creatomate when execute=True; otherwise returns a dry-run stub."""

        if not execute:
            return {'status': 'skipped', 'reason': 'dry_run', 'payload': payload}

        if not self.api_key:
            raise CreatomateError('Creatomate API key is required when execute=True')

        endpoint = f'{self.base_url}/renders'
        body = json.dumps(payload).encode('utf-8')

        req = request.Request(endpoint, data=body, method='POST')
        req.add_header('Content-Type', 'application/json')
        req.add_header('Authorization', f'Bearer {self.api_key.strip()}')

        try:
            with request.urlopen(req, timeout=self.timeout) as response:
                data = response.read().decode('utf-8')
                return json.loads(data)
        except error.HTTPError as exc:
            details = exc.read().decode('utf-8') if exc.fp else None
            raise CreatomateError(
                f'Creatomate API error ({exc.code}): {details or exc.reason}',
                status=exc.code,
                details=details,
            ) from exc
        except error.URLError as exc:
            raise CreatomateError('Failed to reach Creatomate API', details=str(exc)) from exc


__all__ = [
    'CreatomateError',
    'CreatomateRenderConfig',
    'CreatomateRenderer',
    'PoiContext',
    'Storyboard',
    'StoryboardSegment',
]
