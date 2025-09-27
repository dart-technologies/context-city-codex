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
