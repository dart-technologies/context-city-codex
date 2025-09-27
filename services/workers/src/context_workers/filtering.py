from __future__ import annotations

from typing import Iterable, List, Tuple

from .models import Asset, FilterDecision, FilterRules


def _failed(reason: str, score: float = 0.0) -> Tuple[bool, str, float]:
    return False, reason, score


def _passed(score: float, reason: str = "passed") -> Tuple[bool, str, float]:
    return True, reason, score


def filter_assets(assets: Iterable[Asset], rules: FilterRules | None = None) -> Tuple[List[Asset], List[FilterDecision]]:
    """Apply lightweight moderation + relevance heuristics.

    Returns surviving assets alongside per-asset decisions.
    """

    if rules is None:
        rules = FilterRules()

    survivors: List[Asset] = []
    decisions: List[FilterDecision] = []

    banned = {label.lower() for label in rules.banned_labels}

    for asset in assets:
        reasons: List[str] = []
        score = asset.metrics.engagement
        passed = True

        if asset.is_flagged:
            passed, reason, score = _failed("asset_marked_flagged", 0.0)
            reasons.append(reason)
        elif banned.intersection({label.lower() for label in asset.moderation_labels}):
            passed, reason, score = _failed("moderation_blocked", 0.0)
            reasons.append(reason)
        elif rules.locale_whitelist and asset.language and asset.language not in rules.locale_whitelist:
            passed, reason, score = _failed("locale_not_supported", score)
            reasons.append(reason)
        elif score < rules.min_engagement:
            passed, reason, score = _failed("engagement_below_threshold", score)
            reasons.append(reason)
        else:
            passed, reason, score = _passed(score, "eligible")
            reasons.append(reason)

        decisions.append(
            FilterDecision(
                asset_id=asset.id,
                passed=passed,
                reasons=reasons,
                score=float(score),
            )
        )

        if passed:
            survivors.append(asset)

    return survivors, decisions


def rank_assets(assets: Iterable[Asset]) -> List[Asset]:
    """Order assets by simple engagement + recency heuristics.

    Recency is approximated by a timestamp stored in `extra['timestamp_score']` where higher is newer.
    """

    def asset_score(asset: Asset) -> float:
        engagement = asset.metrics.engagement
        timestamp_score = float(asset.extra.get('timestamp_score', 0))
        return engagement * 0.7 + timestamp_score * 0.3

    return sorted(list(assets), key=asset_score, reverse=True)
