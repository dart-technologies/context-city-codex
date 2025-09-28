from fastapi.testclient import TestClient

from context_workers.api import app


def test_preferences_endpoint_success(monkeypatch):
    monkeypatch.setenv('CODEX_PREFERENCES_ENDPOINT', 'https://preferences.codex.test')
    monkeypatch.setenv('CODEX_PREFERENCES_API_KEY', 'fake-key')

    async def fake_call(payload):
        assert payload['profile']['conversation_history'][0] == 'Bonjour'
        return {
            'primary_locale': 'fr',
            'secondary_locales': ['en'],
            'needs_captions': True,
            'needs_audio_description': False,
            'needs_haptics': False,
            'needs_reduced_motion': True,
            'notes': ['mocked response'],
        }

    monkeypatch.setattr('context_workers.api.preferences_service._call_gpt_service', fake_call)

    client = TestClient(app)
    response = client.post('/preferences', json={'profile': {'conversation_history': ['Bonjour']}})
    assert response.status_code == 200
    payload = response.json()
    assert payload['primary_locale'] == 'fr'
    assert payload['needs_reduced_motion'] is True
    assert 'mocked response' in payload['notes']


def test_preferences_endpoint_missing_env(monkeypatch):
    monkeypatch.delenv('CODEX_PREFERENCES_ENDPOINT', raising=False)
    monkeypatch.delenv('CODEX_PREFERENCES_API_KEY', raising=False)

    client = TestClient(app)
    response = client.post('/preferences', json={'profile': {}})
    assert response.status_code == 500
    assert response.json()['detail'].startswith('Preference service missing')
