from __future__ import annotations

import argparse
import json
from dataclasses import asdict
from pathlib import Path
from typing import List

from .filtering import filter_assets, rank_assets
from .extraction import build_highlight_narrative
from .models import Asset, ExtractionConfig, FilterRules
from .scene_labelling import KeywordSceneLabeler, apply_scene_labels
from .summarization import create_summarizer
from .narrative import create_script_generator
from .codexierge import CodexiergeGenerator


def load_assets(path: Path) -> List[Asset]:
    data = json.loads(path.read_text())
    return [Asset(**item) for item in data]


def main(argv: List[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="ContextCity content intelligence toolkit")
    parser.add_argument('command', choices=['demo'], help='Command to run')
    parser.add_argument('--input', type=Path, required=True, help='Path to a JSON array of assets')
    parser.add_argument('--frame-sample-size', type=int, default=3)
    parser.add_argument('--summarizer', default='static', help='Summarizer provider (static, screenapp)')
    parser.add_argument('--summarizer-endpoint', help='Optional summarization endpoint URL')
    parser.add_argument('--summarizer-api-key', help='Optional summarization API key')
    parser.add_argument('--script-generator', default='static', help='Script generator provider (static, gpt)')
    parser.add_argument('--script-endpoint', help='Optional script generator endpoint URL')
    parser.add_argument('--script-api-key', help='Optional script generator API key')
    args = parser.parse_args(argv)

    assets = load_assets(args.input)
    survivors, decisions = filter_assets(assets, FilterRules())
    ranked = rank_assets(survivors)
    labeler = KeywordSceneLabeler({
        'celebration': ['celebrat', 'fans', 'party'],
        'food-and-drink': ['tapa', 'brunch', 'cocktail', 'wine'],
        'transit': ['metro', 'train', 'ferry', 'path'],
    })
    labelled_assets = apply_scene_labels(ranked, labeler)

    summarizer = create_summarizer(args.summarizer, {
        'endpoint': args.summarizer_endpoint,
        'api_key': args.summarizer_api_key,
    })
    script_generator = create_script_generator(args.script_generator, {
        'endpoint': args.script_endpoint,
        'api_key': args.script_api_key,
    })
    narrative = build_highlight_narrative(
        labelled_assets,
        ExtractionConfig(frame_sample_size=args.frame_sample_size),
        summarizer=summarizer,
        script_generator=script_generator,
    )

    output = {
        'narrative': asdict(narrative),
        'decisions': [asdict(decision) for decision in decisions],
    }

    print(json.dumps(output, indent=2))


if __name__ == '__main__':
    main()
