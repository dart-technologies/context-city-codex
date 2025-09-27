from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class AssetMetrics:
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0

    @property
    def engagement(self) -> int:
        return self.likes + self.comments + self.shares


@dataclass
class Asset:
    id: str
    source: str
    url: str
    caption: Optional[str] = None
    language: Optional[str] = None
    moderation_labels: List[str] = field(default_factory=list)
    is_flagged: bool = False
    metrics: AssetMetrics | Dict[str, Any] = field(default_factory=AssetMetrics)
    tags: List[str] = field(default_factory=list)
    scenes: List[str] = field(default_factory=list)
    extra: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if isinstance(self.metrics, dict):
            self.metrics = AssetMetrics(**self.metrics)


@dataclass
class FilterDecision:
    asset_id: str
    passed: bool
    reasons: List[str] = field(default_factory=list)
    score: float = 0.0


@dataclass
class ScriptBeat:
    id: str
    title: str
    content: str


@dataclass
class CodexiergeDialogue:
    locale: str
    greeting: str
    guidance: str
    celebration: str


@dataclass
class NarrativeScript:
    beats: List[ScriptBeat]
    locale: str = 'en'
    provenance: Dict[str, Any] = field(default_factory=dict)


@dataclass
class HighlightFrame:
    image_url: str
    caption: Optional[str] = None


@dataclass
class HighlightNarrative:
    asset_ids: List[str]
    summary: str
    frames: List[HighlightFrame]
    rationale: List[str]
    language: str = 'en'
    script: Optional['NarrativeScript'] = None
    codexierge: Dict[str, 'CodexiergeDialogue'] = field(default_factory=dict)
    provenance: Dict[str, Any] = field(default_factory=dict)


@dataclass
class FilterRules:
    banned_labels: List[str] = field(default_factory=lambda: ['explicit', 'violence'])
    max_flagged_ratio: float = 0.2
    min_engagement: int = 10
    locale_whitelist: Optional[List[str]] = None


@dataclass
class ExtractionConfig:
    frame_sample_size: int = 3
    rationale_template: str = 'Codex elevated these moments for their energy and relevance.'
