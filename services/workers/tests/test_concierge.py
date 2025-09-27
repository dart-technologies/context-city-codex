from context_workers.codexierge import CodexiergeGenerator
from context_workers.models import Asset


def test_concierge_generator_produces_localized_dialogues():
    generator = CodexiergeGenerator()
    asset = Asset(id='1', source='instagram', url='https://example.com', caption='Fans celebrate the ferry ride', tags=['ferry'], scenes=['celebration', 'transit'])
    dialogues = generator.generate([asset])
    assert 'en' in dialogues
    assert 'es' in dialogues
    assert 'celebration' in dialogues['en'].guidance
