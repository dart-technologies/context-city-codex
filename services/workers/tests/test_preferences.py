import json

from context_workers.preferences import detect_preferences


def test_detect_preferences_language_and_accessibility(monkeypatch):
    monkeypatch.delenv('CODEX_PREFERENCES_ENDPOINT', raising=False)
    monkeypatch.delenv('CODEX_PREFERENCES_API_KEY', raising=False)
    profile = {
        'settings': {
            'preferred_locale': 'en-US',
        },
        'signals': [
            {'type': 'locale_hint', 'value': 'es-MX'},
            {'type': 'note', 'value': 'Needs captions when traveling'},
        ],
        'conversation_history': [
            {'role': 'user', 'content': '¡Hola Codex! Prefiero español y necesito subtítulos.'},
            {'role': 'assistant', 'content': 'Noted. Will add captions.'},
        ],
    }

    result = detect_preferences(profile)
    assert result.primary_locale in {'es', 'es-mx'}
    assert 'en' in result.secondary_locales
    assert result.needs_captions is True
    assert any('captions' in note.lower() for note in result.notes)


def test_detect_preferences_defaults_to_en(monkeypatch):
    monkeypatch.delenv('CODEX_PREFERENCES_ENDPOINT', raising=False)
    monkeypatch.delenv('CODEX_PREFERENCES_API_KEY', raising=False)
    profile = {'conversation_history': ['Thanks!']}  # minimal info
    result = detect_preferences(profile)
    assert result.primary_locale == 'en'
    assert result.secondary_locales == []


def test_detect_preferences_uses_gpt_service(monkeypatch):
    endpoint = 'https://preferences.context.city'
    monkeypatch.setenv('CODEX_PREFERENCES_ENDPOINT', endpoint)
    monkeypatch.setenv('CODEX_PREFERENCES_API_KEY', 'test-key')

    captured: dict = {}

    class DummyResponse:
        def __init__(self, payload: dict):
            self._payload = payload

        def read(self) -> bytes:
            return json.dumps(self._payload).encode('utf-8')

        def __enter__(self):  # pragma: no cover - context manager boilerplate
            return self

        def __exit__(self, exc_type, exc, tb):  # pragma: no cover
            return False

    def fake_urlopen(request, timeout):
        captured['timeout'] = timeout
        captured['url'] = request.full_url
        captured['headers'] = dict(request.headers)
        captured['payload'] = json.loads(request.data.decode('utf-8'))
        return DummyResponse({
            'primary_locale': 'fr',
            'secondary_locales': ['en'],
            'needs_captions': True,
            'needs_audio_description': False,
            'needs_haptics': True,
            'needs_reduced_motion': False,
            'notes': ['GPT preference synthesis'],
        })

    monkeypatch.setattr('urllib.request.urlopen', fake_urlopen)

    profile = {'conversation_history': ['Bonjour! Merci pour les sous-titres.']}
    result = detect_preferences(profile)

    assert captured['url'] == endpoint
    assert captured['headers']['Authorization'] == 'Bearer test-key'
    assert captured['payload']['profile'] == profile
    assert result.primary_locale == 'fr'
    assert result.secondary_locales == ['en']
    assert result.needs_haptics is True
    assert 'GPT preference synthesis' in result.notes
