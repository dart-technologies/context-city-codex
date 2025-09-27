from context_workers.extraction import build_highlight_narrative
from context_workers.models import Asset, ExtractionConfig, NarrativeScript, ScriptBeat


def test_build_highlight_narrative_uses_top_assets():
    assets = [
        Asset(
            id='top',
            source='instagram',
            url='https://example.com/top.jpg',
            caption='Top moment',
            metrics={'likes': 200, 'comments': 30, 'shares': 20, 'views': 2000},
            extra={'timestamp_score': 1},
        ),
        Asset(
            id='second',
            source='tiktok',
            url='https://example.com/second.jpg',
            caption='Second moment',
            metrics={'likes': 100, 'comments': 10, 'shares': 5, 'views': 1000},
            extra={'timestamp_score': 0.5},
        ),
    ]

    narrative = build_highlight_narrative(assets, ExtractionConfig(frame_sample_size=2))

    assert narrative.asset_ids == ['top', 'second']
    assert len(narrative.frames) == 2
    assert 'Top moment' in narrative.summary
    assert narrative.script is not None
    assert len(narrative.script.beats) == 3
    assert 'en' in narrative.codexierge
    assert 'es' in narrative.codexierge


def test_build_highlight_narrative_requires_assets():
    try:
        build_highlight_narrative([])
    except ValueError as exc:
        assert 'At least one asset' in str(exc)
    else:
        raise AssertionError('Expected ValueError when no assets provided')

class DummySummarizer:
    def __init__(self) -> None:
        self.calls = 0

    def summarize(self, captions, locale=None):
        captions = list(captions)
        self.calls += 1
        locale = locale or 'en'
        return f"Summary for {len(captions)} captions in {locale}"


def test_build_highlight_narrative_uses_custom_summarizer():
    assets = [
        Asset(
            id='only',
            source='instagram',
            url='https://example.com/only.jpg',
            caption='Only clip',
            metrics={'likes': 10, 'comments': 2, 'shares': 1, 'views': 100},
            extra={'timestamp_score': 1},
        )
    ]
    summarizer = DummySummarizer()
    narrative = build_highlight_narrative(assets, summarizer=summarizer)
    assert 'Summary for 1 captions in en' in narrative.summary
    assert summarizer.calls == 1


class DummyScriptGenerator:
    def __init__(self):
        self.calls = 0

    def generate(self, assets, locale=None):
        self.calls += 1
        return NarrativeScript(
            beats=[ScriptBeat(id='beat-1', title='Custom', content='Custom content')],
            locale=locale or 'en',
            provenance={'generator': 'dummy'},
        )


def test_build_highlight_narrative_uses_custom_script_generator():
    assets = [
        Asset(
            id='only',
            source='instagram',
            url='https://example.com/only.jpg',
            caption='Only clip',
            metrics={'likes': 10, 'comments': 2, 'shares': 1, 'views': 100},
            extra={'timestamp_score': 1},
        )
    ]
    summarizer = DummySummarizer()
    script_generator = DummyScriptGenerator()
    narrative = build_highlight_narrative(
        assets,
        summarizer=summarizer,
        script_generator=script_generator,
    )
    assert narrative.script.provenance['generator'] == 'dummy'
    assert script_generator.calls == 1
