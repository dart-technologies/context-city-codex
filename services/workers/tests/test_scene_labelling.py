from context_workers.models import Asset
from context_workers.scene_labelling import KeywordSceneLabeler, apply_scene_labels


def test_keyword_scene_labeller_assigns_label_from_caption():
    asset = Asset(
        id='1',
        source='instagram',
        url='https://example.com/1.jpg',
        caption='Celebration at the ferry dock',
        tags=['worldcup'],
    )
    labeler = KeywordSceneLabeler({'transit': ['ferry'], 'celebration': ['celebrat']})
    [labelled] = apply_scene_labels([asset], labeler)
    assert 'transit' in labelled.scenes
    assert 'celebration' in labelled.scenes


def test_keyword_scene_labeller_falls_back_to_default():
    asset = Asset(
        id='2',
        source='tiktok',
        url='https://example.com/2.jpg',
        caption='Unlabelled moment',
        tags=[],
    )
    labeler = KeywordSceneLabeler({'food': ['tapas']}, default_label='general')
    [labelled] = apply_scene_labels([asset], labeler)
    assert labelled.scenes == ['general']
