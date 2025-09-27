import json
from context_workers.models import Asset
from context_workers.narrative import StaticScriptGenerator, create_script_generator


def test_static_script_generator_creates_three_beats():
    generator = StaticScriptGenerator()
    asset = Asset(id='a', source='instagram', url='https://example.com', caption='Fans cheer', tags=['fans'])
    script = generator.generate([asset])
    assert len(script.beats) == 3
    assert script.provenance['generator'] == 'static'


def test_create_script_generator_static_default():
    generator = create_script_generator(None)
    asset = Asset(id='a', source='instagram', url='https://example.com', caption='Fans cheer', tags=['fans'])
    script = generator.generate([asset])
    assert script.locale == 'en'
