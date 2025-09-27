from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable

from .models import Asset, CodexiergeDialogue


@dataclass
class CodexiergePromptConfig:
    locales: Iterable[str] = ('en', 'es', 'fr')


class CodexiergeGenerator:
    """Generates localized codexierge dialogue stubs."""

    def __init__(self, config: CodexiergePromptConfig | None = None) -> None:
        self.config = config or CodexiergePromptConfig()

    def generate(self, assets: Iterable[Asset]) -> Dict[str, CodexiergeDialogue]:
        assets = list(assets)
        scenes = {scene for asset in assets for scene in asset.scenes}
        greetings = {
            'en': 'Dartagnan here! Ready for your World Cup adventure?',
            'es': '¡Soy Dartagnan! ¿Listo para tu aventura mundialista?',
            'fr': "C'est Dartagnan ! Prêt pour ton aventure Coupe du Monde ?",
        }
        guidance = {
            'en': f"Codex spotted {', '.join(scenes) or 'city energy'} — follow my cues for smooth hops.",
            'es': f"Codex vio {', '.join(scenes) or 'ambiente urbano'} — sigue mis pistas para moverte sin fricciones.",
            'fr': f"Codex a repéré {', '.join(scenes) or 'energie de la ville'} — suis mes indications pour avancer sans stress.",
        }
        celebration = {
            'en': 'Meet me at Liberty State Park for the celebration finale! 🥳',
            'es': '¡Te espero en Liberty State Park para celebrar a lo grande! 🥳',
            'fr': 'Rendez-vous à Liberty State Park pour fêter la victoire ! 🥳',
        }

        dialogues: Dict[str, CodexiergeDialogue] = {}
        for locale in self.config.locales:
            base_locale = locale.split('-')[0]
            dialogues[locale] = CodexiergeDialogue(
                locale=locale,
                greeting=greetings.get(base_locale, greetings['en']),
                guidance=guidance.get(base_locale, guidance['en']),
                celebration=celebration.get(base_locale, celebration['en']),
            )
        return dialogues
