import json
import sys
import types

from context_workers.models import Asset, HighlightFrame, HighlightNarrative, NarrativeScript, ScriptBeat
from context_workers.video_assembly import CreatomateRenderConfig, CreatomateRenderer, PoiContext
from context_workers.storage import StorageConfig, LocalRenderStorage, create_storage


def build_storyboard_and_payload():
    renderer = CreatomateRenderer(CreatomateRenderConfig(template_id='tmpl-123'))
    script = NarrativeScript(
        beats=[
            ScriptBeat(id='b1', title='Kickoff', content='Fans gather ahead of kickoff.'),
        ],
        locale='en',
    )
    narrative = HighlightNarrative(
        asset_ids=['asset-1'],
        summary='Electric energy on the Hudson.',
        frames=[HighlightFrame(image_url='https://cdn.example.com/frame1.jpg', caption='Opening whistle vibes')],
        rationale=['Captured during pre-match rally.'],
        language='en',
        script=script,
        codexierge={},
        provenance={'summarizer': 'static'},
    )
    assets = [
        Asset(
            id='asset-1',
            source='instagram',
            url='https://social.example.com/clip1.mp4',
            caption='Fans marching with drums',
            metrics={'likes': 120, 'comments': 18, 'shares': 9, 'views': 5000},
            tags=['fans', 'march'],
        )
    ]
    poi = PoiContext(id='poi-felix', name='Felix Rooftop', locale='en', distance='0.8 km')
    storyboard = renderer.build_storyboard(narrative, assets, poi)
    render_payload = renderer.build_render_payload(storyboard)
    manifest = renderer.create_manifest(storyboard, render_payload)
    render_response = {'status': 'skipped', 'reason': 'dry_run', 'payload': render_payload, 'id': 'render-test'}
    return storyboard, render_payload, manifest, render_response


def test_local_storage_writes_artifacts(tmp_path):
    storyboard, render_payload, manifest, render_response = build_storyboard_and_payload()
    config = StorageConfig(output_dir=tmp_path / 'renders', base_url='https://cdn.context.city/renders')
    storage = LocalRenderStorage(config)

    result = storage.store(
        storyboard=storyboard,
        render_payload=render_payload,
        manifest=manifest,
        render_response=render_response,
    )

    manifest_path = tmp_path / 'renders' / 'poi-felix' / 'render-test' / 'manifest.json'
    assert manifest_path.exists()
    data = json.loads(manifest_path.read_text())
    assert data['provider'] == 'creatomate'
    assert result.signed_manifest_url.endswith('/poi-felix/render-test/manifest.json?signature=demo')
    assert result.metadata['asset_count'] == 1


def test_local_storage_generates_placeholder_video_url(tmp_path):
    storyboard, render_payload, manifest, render_response = build_storyboard_and_payload()
    render_response = {'status': 'queued', 'render_id': 'render-456'}
    config = StorageConfig(output_dir=tmp_path / 'renders', base_url='https://cdn.context.city/renders')
    storage = LocalRenderStorage(config)

    result = storage.store(
        storyboard=storyboard,
        render_payload=render_payload,
        manifest=manifest,
        render_response=render_response,
    )

    assert result.render_id == 'render-456'
    assert result.signed_video_url.endswith('/poi-felix/render-456/render.mp4?signature=demo')


def install_fake_gcs(monkeypatch):
    uploads = {}

    class FakeBlob:
        def __init__(self, bucket, name):
            self.bucket = bucket
            self.name = name

        def upload_from_string(self, data, content_type=None):
            self.bucket.uploads[self.name] = {'data': data, 'content_type': content_type}

        def generate_signed_url(self, expiration, method='GET'):
            return f'https://signed/{self.name}?ttl={int(expiration.total_seconds())}'

    class FakeBucket:
        def __init__(self, name):
            self.name = name
            self.uploads = uploads.setdefault(name, {})

        def blob(self, name):
            return FakeBlob(self, name)

    class FakeClient:
        def __init__(self, *args, **kwargs):
            self._buckets = {}

        def bucket(self, name):
            if name not in self._buckets:
                self._buckets[name] = FakeBucket(name)
            return self._buckets[name]

    fake_storage_module = types.ModuleType('google.cloud.storage')
    fake_storage_module.Client = FakeClient

    monkeypatch.setitem(sys.modules, 'google', types.ModuleType('google'))
    monkeypatch.setitem(sys.modules, 'google.cloud', types.ModuleType('google.cloud'))
    monkeypatch.setitem(sys.modules, 'google.cloud.storage', fake_storage_module)
    setattr(sys.modules['google'], 'cloud', sys.modules['google.cloud'])
    setattr(sys.modules['google.cloud'], 'storage', fake_storage_module)

    return uploads


def test_gcs_storage_uploads_artifacts(monkeypatch):
    uploads = install_fake_gcs(monkeypatch)
    storyboard, render_payload, manifest, render_response = build_storyboard_and_payload()
    config = StorageConfig(
        provider='gcs',
        gcs_bucket='codex-reels-demo',
        gcs_prefix='world-cup',
        signed_url_ttl=600,
    )
    storage = create_storage(config)

    result = storage.store(
        storyboard=storyboard,
        render_payload=render_payload,
        manifest=manifest,
        render_response=render_response,
    )

    manifest_key = f"world-cup/poi-felix/{result.render_id}/manifest.json"
    bucket_uploads = uploads['codex-reels-demo']
    assert manifest_key in bucket_uploads
    assert json.loads(bucket_uploads[manifest_key]['data'])['provider'] == 'creatomate'
    assert result.manifest_path == f'gs://codex-reels-demo/{manifest_key}'
    assert result.signed_manifest_url == f'https://signed/{manifest_key}?ttl=600'


def test_gcs_storage_optionally_copies_video(monkeypatch):
    uploads = install_fake_gcs(monkeypatch)
    storyboard, render_payload, manifest, render_response = build_storyboard_and_payload()
    render_response = {'status': 'ready', 'download_url': 'https://example.com/render.mp4'}
    config = StorageConfig(
        provider='gcs',
        gcs_bucket='codex-reels-demo',
        gcs_prefix='world-cup',
        copy_video_asset=True,
    )
    storage = create_storage(config)
    monkeypatch.setattr(storage, '_fetch_bytes', lambda url: b'video-bytes')

    result = storage.store(
        storyboard=storyboard,
        render_payload=render_payload,
        manifest=manifest,
        render_response=render_response,
    )

    bucket_uploads = uploads['codex-reels-demo']
    video_key = f"world-cup/poi-felix/{result.render_id}/render.mp4"
    assert bucket_uploads[video_key]['content_type'] == 'video/mp4'
    assert result.signed_video_url.endswith(f'{video_key}?ttl=3600') or result.signed_video_url == render_response['download_url']
