from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, Iterable, List, Protocol

from .models import Asset


class SceneLabeler(Protocol):
    """Assign descriptive scene labels to an asset."""

    def label(self, asset: Asset) -> List[str]: ...


@dataclass
class KeywordSceneLabeler:
    """Naive keyword-driven labeller using captions and tags."""

    keyword_map: Dict[str, List[str]]
    default_label: str = "general"

    def label(self, asset: Asset) -> List[str]:
        caption = (asset.caption or "").lower()
        tags = {tag.lower() for tag in asset.tags}
        matches: List[str] = []

        for label, keywords in self.keyword_map.items():
            for keyword in keywords:
                if keyword.lower() in caption or keyword.lower() in tags:
                    matches.append(label)
                    break

        if matches:
            return sorted(set(matches))

        if caption:
            thematic = _derive_thematic_label(caption)
            if thematic:
                matches.append(thematic)

        if not matches:
            matches.append(self.default_label)

        return matches


def _derive_thematic_label(caption: str) -> str | None:
    patterns = {
        'celebration': r'celebrat|cheer|party',
        'food-and-drink': r'tapa|brunch|cocktail|wine',
        'transit': r'metro|train|ferry|path',
    }
    for label, pattern in patterns.items():
        if re.search(pattern, caption):
            return label
    return None


def apply_scene_labels(assets: Iterable[Asset], labeler: SceneLabeler) -> List[Asset]:
    labelled: List[Asset] = []
    for asset in assets:
        asset.scenes = labeler.label(asset)
        labelled.append(asset)
    return labelled
