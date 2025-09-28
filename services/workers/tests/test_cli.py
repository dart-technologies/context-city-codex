import json
from pathlib import Path

from context_workers.cli import main


def test_cli_demo(tmp_path: Path, monkeypatch, capsys):
    fixture = Path('fixtures/sample_assets.json')
    monkeypatch.chdir(Path(__file__).resolve().parents[1])
    main(['demo', '--input', str(fixture), '--frame-sample-size', '2'])
    output = capsys.readouterr().out
    payload = json.loads(output)
    assert 'narrative' in payload
    assert len(payload['narrative']['frames']) == 2
    assert payload['narrative']['script']['beats']
    assert payload['narrative']['codexierge']['en']
    assert 'remotionProps' in payload
    assert len(payload['remotionProps']['segments']) == 2
    assert payload['remotionProps']['segments'][0]['subtitles']['en']
    assert 'es' in payload['remotionProps']['narrations']
    assert 'fr' in payload['remotionProps']['narrations']
    assert payload['remotionProps']['segments'][0]['subtitles']['es']


def test_cli_render_builds_creatomate_payload(tmp_path: Path, monkeypatch, capsys):
    fixture = Path('fixtures/sample_assets.json')
    monkeypatch.chdir(Path(__file__).resolve().parents[1])
    output_dir = tmp_path / 'renders'
    main([
        'render',
        '--input', str(fixture),
        '--frame-sample-size', '2',
        '--poi-id', 'poi-felix',
        '--poi-name', 'Felix Rooftop',
        '--poi-tags', 'soccer,fans',
        '--creatomate-template-id', 'tmpl-123',
        '--creatomate-clip-duration', '4',
        '--storage-output-dir', str(output_dir),
        '--storage-base-url', 'https://cdn.context.city/renders',
    ])
    output = capsys.readouterr().out
    payload = json.loads(output)
    assert payload['render_payload']['template_id'] == 'tmpl-123'
    assert payload['render_payload']['metadata']['poi_id'] == 'poi-felix'
    assert payload['render_response']['status'] == 'skipped'
    assert payload['manifest']['provider'] == 'creatomate'
    assert payload['storage']['provider'] == 'local'
    assert payload['storage']['signed_manifest_url'].endswith('/poi-felix/' + payload['storage']['render_id'] + '/manifest.json?signature=demo')
    assert payload['remotionProps']['poi']['name'] == 'Felix Rooftop'
    assert len(payload['remotionProps']['segments']) == 2
    assert payload['remotionProps']['segments'][0]['subtitles']['en']
    assert payload['remotionProps']['narrations']['en']['subtitles']['asset-1']
    assert payload['remotionProps']['narrations']['es']['subtitles']['asset-2']


def test_cli_writes_remotion_props_file(tmp_path: Path, monkeypatch, capsys):
    fixture = Path('fixtures/sample_assets.json')
    output_path = tmp_path / 'remotion' / 'props.json'
    monkeypatch.chdir(Path(__file__).resolve().parents[1])
    main([
        'demo',
        '--input', str(fixture),
        '--frame-sample-size', '2',
        '--remotion-props-output', str(output_path),
    ])
    result = json.loads(capsys.readouterr().out)
    assert output_path.exists()
    file_data = json.loads(output_path.read_text())
    assert file_data == result['remotionProps']


def test_cli_remotion_media_dir_overrides(tmp_path: Path, monkeypatch, capsys):
    fixture = Path('fixtures/sample_assets.json')
    media_dir = tmp_path / 'media'
    media_dir.mkdir()
    (media_dir / 'asset-1.jpg').write_bytes(b'local-1')
    (media_dir / 'asset-2.jpg').write_bytes(b'local-2')
    monkeypatch.chdir(Path(__file__).resolve().parents[1])
    main([
        'demo',
        '--input', str(fixture),
        '--frame-sample-size', '2',
        '--remotion-media-dir', str(media_dir),
    ])
    payload = json.loads(capsys.readouterr().out)
    media_urls = [seg['mediaUrl'] for seg in payload['remotionProps']['segments']]
    assert all(url.startswith('static://') for url in media_urls)
