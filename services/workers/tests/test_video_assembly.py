from context_workers.models import (
    Asset,
    CodexiergeDialogue,
    HighlightFrame,
    HighlightNarrative,
    NarrativeScript,
    ScriptBeat,
)
from context_workers.video_assembly import (
    CreatomateRenderConfig,
    CreatomateRenderer,
    PoiContext,
)


def build_sample_narrative():
    script = NarrativeScript(
        beats=[
            ScriptBeat(id='b1', title='Kickoff', content='Fans gather ahead of kickoff.'),
            ScriptBeat(id='b2', title='Halftime', content='Crowd surges toward the fan fest.'),
        ],
        locale='en',
        provenance={'generator': 'static'},
    )
    codexierge = {
        'en': CodexiergeDialogue(
            locale='en',
            greeting='Dartagnan ready to guide you!',
            guidance='Follow the drums to the waterfront.',
            celebration='Meet at the fireworks finale!',
        )
    }
    return HighlightNarrative(
        asset_ids=['asset-1', 'asset-2'],
        summary='World Cup energy rolling through Liberty State Park.',
        frames=[
            HighlightFrame(image_url='https://cdn.example.com/frame1.jpg', caption='Opening whistle vibes'),
            HighlightFrame(image_url='https://cdn.example.com/frame2.jpg', caption='Halftime fireworks'),
        ],
        rationale=[
            'Captured during pre-match rally with official fan groups.',
            'Features verified halftime programming from organizers.',
        ],
        language='en',
        script=script,
        codexierge=codexierge,
        provenance={'summarizer': 'static', 'script_generator': 'static'},
    )


def build_assets():
    return [
        Asset(
            id='asset-1',
            source='instagram',
            url='https://social.example.com/clip1.mp4',
            caption='Fans marching with drums',
            metrics={'likes': 120, 'comments': 18, 'shares': 9, 'views': 5000},
            tags=['fans', 'march'],
        ),
        Asset(
            id='asset-2',
            source='tiktok',
            url='https://social.example.com/clip2.mp4',
            caption='Fireworks over the Hudson',
            metrics={'likes': 250, 'comments': 40, 'shares': 20, 'views': 9000},
            tags=['fireworks', 'hudson'],
        ),
    ]


def test_storyboard_segments_include_script_and_metrics():
    narrative = build_sample_narrative()
    assets = build_assets()
    context = PoiContext(id='poi-felix', name='Felix Rooftop')
    renderer = CreatomateRenderer(CreatomateRenderConfig(template_id='tmpl-123'))

    storyboard = renderer.build_storyboard(narrative, assets, context)

    assert len(storyboard.segments) == 2
    first_segment = storyboard.segments[0]
    assert first_segment.script_title == 'Kickoff'
    assert first_segment.metrics['engagement'] == 147
    assert first_segment.caption == 'Opening whistle vibes'


def test_render_payload_contains_segment_modifications():
    narrative = build_sample_narrative()
    assets = build_assets()
    context = PoiContext(id='poi-felix', name='Felix Rooftop', distance='0.8 km', hours='Opens 10:00')
    renderer = CreatomateRenderer(
        CreatomateRenderConfig(
            template_id='tmpl-123',
            default_music_track='https://cdn.example.com/score.mp3',
            clip_duration=4,
        )
    )
    storyboard = renderer.build_storyboard(narrative, assets, context)
    payload = renderer.build_render_payload(storyboard)

    assert payload['template_id'] == 'tmpl-123'
    assert any(mod['name'] == 'segment_1_overlay' and 'Opening whistle vibes' in mod['text'] for mod in payload['modifications'])
    assert any(mod['name'] == 'soundtrack' for mod in payload['modifications'])
    assert payload['metadata']['poi_id'] == 'poi-felix'


def test_manifest_includes_segments_and_provenance():
    narrative = build_sample_narrative()
    assets = build_assets()
    context = PoiContext(id='poi-felix', name='Felix Rooftop', tags=['soccer', 'fans'])
    renderer = CreatomateRenderer(CreatomateRenderConfig(template_id='tmpl-123'))
    storyboard = renderer.build_storyboard(narrative, assets, context)
    payload = renderer.build_render_payload(storyboard)
    manifest = renderer.create_manifest(storyboard, payload)

    assert manifest['provider'] == 'creatomate'
    assert manifest['narrative']['summary'] == narrative.summary
    assert manifest['segments'][0]['asset_id'] == 'asset-1'
    assert manifest['provenance']['script_generator'] == 'static'
