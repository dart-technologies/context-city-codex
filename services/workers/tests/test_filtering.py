from context_workers.filtering import filter_assets, rank_assets
from context_workers.models import Asset, FilterRules


def test_filtering_blocks_moderation_and_low_engagement():
    assets = [
        Asset(
            id='safe',
            source='instagram',
            url='https://example.com/1.jpg',
            caption='Celebration',
            metrics={'likes': 50, 'comments': 5, 'shares': 2, 'views': 100},
            moderation_labels=[],
            extra={'timestamp_score': 1.0},
        ),
        Asset(
            id='flagged',
            source='instagram',
            url='https://example.com/2.jpg',
            caption='Too edgy',
            metrics={'likes': 1, 'comments': 0, 'shares': 0, 'views': 10},
            moderation_labels=['explicit'],
            extra={'timestamp_score': 0.1},
        ),
    ]

    survivors, decisions = filter_assets(assets, FilterRules(min_engagement=10))

    assert [asset.id for asset in survivors] == ['safe']
    flagged_decision = next(dec for dec in decisions if dec.asset_id == 'flagged')
    assert flagged_decision.passed is False
    assert 'moderation_blocked' in flagged_decision.reasons

    ranked = rank_assets(survivors)
    assert ranked[0].id == 'safe'
