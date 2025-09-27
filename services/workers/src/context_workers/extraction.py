from __future__ import annotations

from typing import Iterable, List, Optional

from .models import Asset, ExtractionConfig, HighlightFrame, HighlightNarrative
from .narrative import ScriptGenerator, StaticScriptGenerator
from .codexierge import CodexiergeGenerator
from .summarization import Summarizer, StaticSummarizer


def build_highlight_narrative(
    assets: Iterable[Asset],
    config: Optional[ExtractionConfig] = None,
    summarizer: Optional[Summarizer] = None,
    script_generator: Optional[ScriptGenerator] = None,
) -> HighlightNarrative:
    """Compose a highlight narrative from ranked assets."""

    if config is None:
        config = ExtractionConfig()

    assets = list(assets)
    if not assets:
        raise ValueError('At least one asset is required to assemble a highlight narrative.')

    frames: List[HighlightFrame] = []
    rationale: List[str] = []

    for asset in assets[: config.frame_sample_size]:
        frames.append(HighlightFrame(image_url=asset.url, caption=asset.caption))
        rationale.append(_rationale_from_asset(asset))

    if summarizer is None:
        summarizer = StaticSummarizer()

    captions = [asset.caption or asset.source.title() for asset in assets]
    summary = summarizer.summarize(captions, locale=assets[0].language)
    if not summary:
        summary = _compose_summary(assets)

    if script_generator is None:
        script_generator = StaticScriptGenerator()
    script = script_generator.generate(assets[: config.frame_sample_size], locale=assets[0].language)

    codexierge = CodexiergeGenerator().generate(assets[: config.frame_sample_size])

    provenance = {
        'script_generator': script.provenance.get('generator'),
        'summarizer': getattr(summarizer, '__class__', type(summarizer)).__name__,
    }

    return HighlightNarrative(
        asset_ids=[asset.id for asset in assets[: config.frame_sample_size]],
        summary=summary,
        frames=frames,
        rationale=rationale or [config.rationale_template],
        language=assets[0].language or 'en',
        script=script,
        codexierge=codexierge,
        provenance=provenance,
    )


def _rationale_from_asset(asset: Asset) -> str:
    momentum = asset.metrics.engagement
    caption = asset.caption or 'community moment'
    source = asset.source.title()
    scene = asset.scenes[0] if getattr(asset, 'scenes', []) else 'highlight'
    return f"{source} {scene} ({momentum} engagements) featuring {caption[:80]}"


def _compose_summary(assets: List[Asset]) -> str:
    top = assets[0]
    total_engagement = sum(asset.metrics.engagement for asset in assets)
    return (
        f"Codex spotlight: {top.caption or top.source.title()} is trending with "
        f"{total_engagement} combined engagements across {len(assets)} assets."
    )
