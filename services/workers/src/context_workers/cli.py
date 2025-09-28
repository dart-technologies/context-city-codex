from __future__ import annotations

import argparse
import json
from dataclasses import asdict
import copy
from pathlib import Path
from typing import Dict, List

from .filtering import filter_assets, rank_assets
from .extraction import build_highlight_narrative
from .models import Asset, ExtractionConfig, FilterRules, LocaleNarration, AccessibilityAssets
from .preferences import detect_preferences
from .scene_labelling import KeywordSceneLabeler, apply_scene_labels
from .summarization import create_summarizer
from .narrative import create_script_generator
from .video_assembly import CreatomateRenderConfig, CreatomateRenderer, PoiContext
from .storage import StorageConfig, create_storage
from .translation import TranslationItem, create_translator
from .accessibility import (
    AccessibilityItem,
    AccessibilityGenerator,
    StaticAccessibilityGenerator,
    create_accessibility_generator,
)


def load_assets(path: Path) -> List[Asset]:
    data = json.loads(path.read_text())
    return [Asset(**item) for item in data]


def comma_separated_list(value: str | None) -> List[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(',') if item.strip()]


def parse_locale_list(value: str | None, fallback: str) -> List[str]:
    locales = comma_separated_list(value)
    if not locales:
        return [fallback]
    base_norm = fallback.split('-')[0]
    if all(locale.split('-')[0] != base_norm for locale in locales):
        locales = [fallback, *locales]
    return locales


def localize_text(text: str, locale: str, base_locale: str) -> str:
    base = base_locale.split('-')[0]
    target = locale.split('-')[0]
    if target == base:
        return text
    return f"[{locale}] {text}"
STATIC_ACCESSIBILITY_FALLBACK = StaticAccessibilityGenerator()


def collect_translation_items(storyboard) -> List[TranslationItem]:
    items: List[TranslationItem] = []

    narrative = storyboard.narrative
    if narrative.summary:
        items.append(TranslationItem('narrative.summary', narrative.summary))

    for index, rationale in enumerate(narrative.rationale):
        items.append(TranslationItem(f'narrative.rationale.{index}', rationale))

    if narrative.script:
        for beat in narrative.script.beats:
            items.append(TranslationItem(f'script.{beat.id}.title', beat.title))
            items.append(TranslationItem(f'script.{beat.id}.content', beat.content))

    for segment in storyboard.segments:
        if segment.caption:
            items.append(TranslationItem(f'segment.{segment.asset_id}.caption', segment.caption))
        if segment.script_title:
            items.append(TranslationItem(f'segment.{segment.asset_id}.title', segment.script_title))
        if segment.script_content:
            items.append(TranslationItem(f'segment.{segment.asset_id}.script', segment.script_content))
        if segment.rationale:
            items.append(TranslationItem(f'segment.{segment.asset_id}.rationale', segment.rationale))
        if segment.frame and segment.frame.caption:
            items.append(TranslationItem(f'frame.{segment.asset_id}.caption', segment.frame.caption))

    return items


def _ensure_translation_coverage(
    items: List[TranslationItem],
    translations: Dict[str, str],
    locale: str,
    base_locale: str,
) -> Dict[str, str]:
    results = dict(translations)
    for item in items:
        if not item.text:
            continue
        if not results.get(item.key):
            results[item.key] = localize_text(item.text, locale, base_locale)
    return results


def generate_voiceovers_and_subtitles(
    storyboard,
    locales: List[str],
    *,
    audio_prefix: str | None,
    translator,
) -> Dict[str, LocaleNarration]:
    base_locale = storyboard.narrative.language or 'en'
    narrations: Dict[str, LocaleNarration] = {}

    translation_items = collect_translation_items(storyboard)
    base_translations = {item.key: item.text for item in translation_items}
    storyboard.narrative.translations[base_locale] = base_translations.copy()

    for locale in locales:
        if not locale:
            continue

        subtitle_map: Dict[str, str] = {}
        target_base = locale.split('-')[0]
        if target_base == base_locale.split('-')[0]:
            locale_translations = base_translations.copy()
        else:
            raw_translations = translator.translate(translation_items, locale, source_locale=base_locale)
            locale_translations = _ensure_translation_coverage(translation_items, raw_translations, locale, base_locale)

        storyboard.narrative.translations[locale] = locale_translations

        for segment in storyboard.segments:
            subtitle_candidates = [
                locale_translations.get(f'segment.{segment.asset_id}.script'),
                locale_translations.get(f'segment.{segment.asset_id}.caption'),
                locale_translations.get(f'narrative.summary'),
            ]
            fallback_source = segment.script_content or segment.caption or storyboard.narrative.summary
            localized = next((text for text in subtitle_candidates if text), localize_text(fallback_source, locale, base_locale))
            segment.subtitles[locale] = localized
            if segment.frame:
                segment.frame.subtitles[locale] = localized
            subtitle_map[segment.asset_id] = localized

        audio_url = None
        if audio_prefix:
            prefix = audio_prefix.rstrip('/')
            audio_url = f"{prefix}/{storyboard.poi.id}-{locale}.mp3"

        narrations[locale] = LocaleNarration(
            locale=locale,
            audio_url=audio_url,
            voice=None,
            subtitles=subtitle_map,
        )

    storyboard.narrative.narrations = narrations
    return narrations


def generate_accessibility_assets(
    storyboard,
    locales: List[str],
    *,
    generator: AccessibilityGenerator,
) -> Dict[str, AccessibilityAssets]:
    base_locale = storyboard.narrative.language or 'en'
    accessibility_map: Dict[str, AccessibilityAssets] = {}

    for locale in locales:
        if not locale:
            continue

        translations = storyboard.narrative.translations.get(locale) or {}
        items: List[AccessibilityItem] = []
        for segment in storyboard.segments:
            clip_title = translations.get(f'segment.{segment.asset_id}.title') or segment.script_title or segment.caption or 'Highlight'
            clip_summary = (
                translations.get(f'segment.{segment.asset_id}.script')
                or translations.get('narrative.summary')
                or segment.script_content
                or storyboard.narrative.summary
            )
            caption = translations.get(f'segment.{segment.asset_id}.caption') or segment.caption or clip_summary
            rationale = translations.get(f'segment.{segment.asset_id}.rationale') or segment.rationale or clip_summary
            items.append(
                AccessibilityItem(
                    id=segment.asset_id,
                    clip_title=clip_title,
                    clip_summary=clip_summary,
                    caption=caption,
                    rationale=rationale,
                    tags=list(segment.tags),
                    locale=locale,
                    base_locale=base_locale,
                )
            )

        generated = generator.generate(items, target_locale=locale) or {}
        fallback = STATIC_ACCESSIBILITY_FALLBACK.generate(items, target_locale=locale)

        bundle = AccessibilityAssets(locale=locale)
        for item in items:
            fields = generated.get(item.id) or fallback.get(item.id)
            if not fields:
                continue
            bundle.captions[item.id] = fields.caption
            bundle.audio_descriptions[item.id] = fields.audio_description
            bundle.haptic_cues[item.id] = fields.haptic_cue
            bundle.alt_text[item.id] = fields.alt_text

        accessibility_map[locale] = bundle

    storyboard.narrative.accessibility.update(accessibility_map)
    return accessibility_map




def apply_local_media_overrides(storyboard, media_dir: Path | None) -> None:
    if not media_dir:
        return
    media_dir = media_dir.resolve()

    def candidate_names(segment) -> list[str]:
        names: list[str] = []

        def add_from_url(url: str | None):
            if not url:
                return
            base = url.split('?')[0]
            name = Path(base).name
            if name:
                names.append(name)
                suffix = Path(name).suffix or '.jpg'
                names.append(f"{segment.asset_id}{suffix}")

        add_from_url(segment.asset_url)
        if segment.frame:
            add_from_url(segment.frame.image_url)

        if not names:
            names.extend([f"{segment.asset_id}.jpg", f"{segment.asset_id}.png"])
        return names

    for segment in storyboard.segments:
        for name in candidate_names(segment):
            candidate = media_dir / name
            if candidate.exists():
                static_path = f"assets/{candidate.name}"
                segment.asset_url = f"static://{static_path}"
                if segment.frame:
                    segment.frame.image_url = f"static://{static_path}"
                break
def build_remotion_props(
    storyboard,
    *,
    clip_duration_seconds: float,
    transition_ms: int,
    soundtrack_url: str | None,
    brand_color: str | None,
    accent_color: str | None,
):
    segments = []
    for segment in storyboard.segments:
        media_url = segment.asset_url or (segment.frame.image_url if segment.frame else '')
        if media_url.startswith('static://'):
            media_url = media_url
        caption = segment.caption or (segment.frame.caption if segment.frame else '')
        segments.append({
            'assetId': segment.asset_id,
            'mediaUrl': media_url,
            'caption': caption,
            'title': segment.script_title,
            'rationale': segment.rationale,
            'subtitles': segment.subtitles,
        })

    return {
        'poi': {
            'id': storyboard.poi.id,
            'name': storyboard.poi.name,
            'locale': storyboard.poi.locale,
            'distance': storyboard.poi.distance,
            'hours': storyboard.poi.hours,
            'tags': storyboard.poi.tags,
        },
        'summary': storyboard.narrative.summary,
        'codexiergeLocales': list(storyboard.narrative.codexierge.keys()),
        'segments': segments,
        'brandColor': brand_color,
        'accentColor': accent_color,
        'soundtrackUrl': soundtrack_url,
        'clipDurationSeconds': clip_duration_seconds,
        'transitionMs': transition_ms,
        'narrations': {
            locale: asdict(narration)
            for locale, narration in storyboard.narrative.narrations.items()
        },
        'accessibility': {
            locale: {
                'captions': assets.captions,
                'audioDescriptions': assets.audio_descriptions,
                'hapticCues': assets.haptic_cues,
                'altText': assets.alt_text,
            }
            for locale, assets in storyboard.narrative.accessibility.items()
        },
    }


def main(argv: List[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="ContextCity content intelligence toolkit")
    parser.add_argument('command', choices=['demo', 'render'], help='Command to run')
    parser.add_argument('--input', type=Path, required=True, help='Path to a JSON array of assets')
    parser.add_argument('--frame-sample-size', type=int, default=3)
    parser.add_argument('--summarizer', default='static', help='Summarizer provider (static, screenapp)')
    parser.add_argument('--summarizer-endpoint', help='Optional summarization endpoint URL')
    parser.add_argument('--summarizer-api-key', help='Optional summarization API key')
    parser.add_argument('--script-generator', default='static', help='Script generator provider (static, gpt)')
    parser.add_argument('--script-endpoint', help='Optional script generator endpoint URL')
    parser.add_argument('--script-api-key', help='Optional script generator API key')
    parser.add_argument('--translator', default='auto', choices=['auto', 'static', 'gpt'], help='Translation provider (auto env detection, static, gpt)')
    parser.add_argument('--translation-endpoint', help='Optional translation endpoint URL')
    parser.add_argument('--translation-api-key', help='Optional translation API key')
    parser.add_argument('--translation-timeout', type=float, help='Override translation timeout in seconds')
    parser.add_argument('--translation-max-attempts', type=int, help='Maximum attempts for translation service calls')
    parser.add_argument('--accessibility-generator', default='auto', choices=['auto', 'static', 'gpt'], help='Accessibility asset generator (auto env detection, static, gpt)')
    parser.add_argument('--accessibility-endpoint', help='Optional accessibility endpoint URL')
    parser.add_argument('--accessibility-api-key', help='Optional accessibility API key')
    parser.add_argument('--accessibility-timeout', type=float, help='Override accessibility timeout in seconds')
    parser.add_argument('--accessibility-max-attempts', type=int, help='Maximum attempts for accessibility service calls')

    # Render-specific arguments (no-op for demo command).
    parser.add_argument('--poi-id', default='poi-demo')
    parser.add_argument('--poi-name', default='Demo POI')
    parser.add_argument('--poi-locale', help='Override locale for POI context')
    parser.add_argument('--poi-distance')
    parser.add_argument('--poi-hours')
    parser.add_argument('--poi-tags', help='Comma separated tags (e.g. soccer,fan-fest,food)')
    parser.add_argument('--creatomate-template-id')
    parser.add_argument('--creatomate-output-format', default='mp4')
    parser.add_argument('--creatomate-default-music', help='Optional soundtrack URL for the template')
    parser.add_argument('--creatomate-brand-color', default='#0b1221')
    parser.add_argument('--creatomate-accent-color', default='#f5c333')
    parser.add_argument('--creatomate-clip-duration', type=float, default=5.0)
    parser.add_argument('--creatomate-transition-ms', type=int, default=500)
    parser.add_argument('--creatomate-webhook', help='Optional webhook endpoint for render status callbacks')
    parser.add_argument('--creatomate-metadata', help='JSON string appended to render metadata')
    parser.add_argument('--creatomate-api-key', help='Creatomate API key (required when --creatomate-execute is used)')
    parser.add_argument('--creatomate-execute', action='store_true', help='Send the payload to Creatomate instead of dry-run output')
    parser.add_argument('--profile', type=Path, help='Optional Codex profile JSON used to infer language/accessibility preferences via GPT heuristics')

    # Storage arguments.
    parser.add_argument('--storage-provider', default='local', choices=['local', 'gcs', 'none'], help='Storage backend for render artifacts')
    parser.add_argument('--storage-output-dir', default='renders', help='Directory where render artifacts will be persisted when using local storage')
    parser.add_argument('--storage-base-url', help='Base URL used to fabricate signed URLs for local storage (e.g. https://storage.googleapis.com/bucket)')
    parser.add_argument('--storage-retention-days', type=int, default=7, help='Retention window advertised alongside stored artifacts')
    parser.add_argument('--storage-disable-signed-urls', action='store_true', help='Disable generation of signed URL placeholders')
    parser.add_argument('--storage-gcs-bucket', help='Target GCS bucket name (required when using --storage-provider gcs)')
    parser.add_argument('--storage-gcs-prefix', default='renders', help='Object prefix within the GCS bucket')
    parser.add_argument('--storage-gcs-credentials', help='Path to a service account JSON for GCS uploads')
    parser.add_argument('--storage-signed-url-ttl', type=int, default=3600, help='Signed URL lifetime in seconds')
    parser.add_argument('--storage-copy-video', action='store_true', help='Attempt to copy render video into storage when a download URL is available')
    parser.add_argument('--remotion-props-output', type=Path, help='Write Remotion props JSON to this path')
    parser.add_argument('--remotion-media-dir', type=Path, help='Optional directory containing local media files that should replace remote asset URLs when generating Remotion props (matches by filename)')
    parser.add_argument('--voiceover-locales', help='Comma separated locales for narration + subtitles (default inferred from profile/narrative)')
    parser.add_argument('--voiceover-audio-prefix', help='Prefix URL used when fabricating narration audio paths (e.g. https://cdn.example.com/audio)')

    args = parser.parse_args(argv)

    preferences = None
    if args.profile:
        profile_data = json.loads(args.profile.read_text())
        preferences = detect_preferences(profile_data)

    if args.storage_provider == 'gcs' and not args.storage_gcs_bucket:
        parser.error('--storage-gcs-bucket is required when using --storage-provider gcs')

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
    translation_options: Dict[str, object] = {}
    if args.translation_endpoint:
        translation_options['endpoint'] = args.translation_endpoint
    if args.translation_api_key:
        translation_options['api_key'] = args.translation_api_key
    if args.translation_timeout is not None:
        translation_options['timeout'] = args.translation_timeout
    if args.translation_max_attempts is not None:
        translation_options['max_attempts'] = args.translation_max_attempts

    translator = create_translator(args.translator, translation_options)
    accessibility_options: Dict[str, object] = {}
    if args.accessibility_endpoint:
        accessibility_options['endpoint'] = args.accessibility_endpoint
    if args.accessibility_api_key:
        accessibility_options['api_key'] = args.accessibility_api_key
    if args.accessibility_timeout is not None:
        accessibility_options['timeout'] = args.accessibility_timeout
    if args.accessibility_max_attempts is not None:
        accessibility_options['max_attempts'] = args.accessibility_max_attempts

    accessibility_generator = create_accessibility_generator(
        args.accessibility_generator,
        accessibility_options,
    )
    narrative = build_highlight_narrative(
        labelled_assets,
        ExtractionConfig(frame_sample_size=args.frame_sample_size),
        summarizer=summarizer,
        script_generator=script_generator,
    )

    inferred_locale = args.poi_locale or (preferences.primary_locale if preferences else narrative.language)

    poi_context = PoiContext(
        id=args.poi_id or narrative.asset_ids[0],
        name=args.poi_name,
        locale=inferred_locale,
        distance=args.poi_distance,
        hours=args.poi_hours,
        tags=comma_separated_list(args.poi_tags),
    )

    metadata = {'experience': 'codex_social_highlight'}
    if args.creatomate_metadata:
        metadata.update(json.loads(args.creatomate_metadata))

    render_config = CreatomateRenderConfig(
        template_id=args.creatomate_template_id,
        output_format=args.creatomate_output_format,
        clip_duration=args.creatomate_clip_duration,
        transition_ms=args.creatomate_transition_ms,
        brand_color=args.creatomate_brand_color,
        accent_color=args.creatomate_accent_color,
        default_music_track=args.creatomate_default_music,
        webhook_url=args.creatomate_webhook,
        metadata=metadata,
    )

    storyboard_renderer = CreatomateRenderer(render_config)
    storyboard = storyboard_renderer.build_storyboard(narrative, labelled_assets, poi_context)

    fallback_locale = preferences.primary_locale if preferences else (narrative.language or 'en')
    voiceover_locales = parse_locale_list(
        args.voiceover_locales,
        fallback=fallback_locale,
    )
    if preferences:
        seen = {loc.split('-')[0] for loc in voiceover_locales}
        for loc in [preferences.primary_locale, *preferences.secondary_locales]:
            base = loc.split('-')[0]
            if base not in seen:
                voiceover_locales.append(base)
                seen.add(base)
    generate_voiceovers_and_subtitles(
        storyboard,
        voiceover_locales,
        audio_prefix=args.voiceover_audio_prefix,
        translator=translator,
    )
    generate_accessibility_assets(
        storyboard,
        voiceover_locales,
        generator=accessibility_generator,
    )

    remotion_storyboard = copy.deepcopy(storyboard)
    apply_local_media_overrides(remotion_storyboard, args.remotion_media_dir)

    remotion_props = build_remotion_props(
        remotion_storyboard,
        clip_duration_seconds=render_config.clip_duration,
        transition_ms=render_config.transition_ms,
        soundtrack_url=render_config.default_music_track,
        brand_color=render_config.brand_color,
        accent_color=render_config.accent_color,
    )

    if args.remotion_props_output:
        args.remotion_props_output.parent.mkdir(parents=True, exist_ok=True)
        args.remotion_props_output.write_text(json.dumps(remotion_props, indent=2))

    if args.command == 'demo':
        output = {
            'narrative': asdict(narrative),
            'decisions': [asdict(decision) for decision in decisions],
            'remotionProps': remotion_props,
        }
        if preferences:
            output['preferences'] = asdict(preferences)
        print(json.dumps(output, indent=2))
        return

    render_payload = storyboard_renderer.build_render_payload(storyboard)
    manifest = storyboard_renderer.create_manifest(storyboard, render_payload)

    renderer = CreatomateRenderer(render_config, api_key=args.creatomate_api_key)
    render_response = renderer.render(render_payload, execute=args.creatomate_execute)

    storage_result = None
    if args.storage_provider != 'none':
        storage_config = StorageConfig(
            provider=args.storage_provider,
            output_dir=Path(args.storage_output_dir),
            base_url=args.storage_base_url,
            retention_days=args.storage_retention_days,
            generate_signed_urls=not args.storage_disable_signed_urls,
            gcs_bucket=args.storage_gcs_bucket,
            gcs_prefix=args.storage_gcs_prefix,
            gcs_credentials=args.storage_gcs_credentials,
            signed_url_ttl=args.storage_signed_url_ttl,
            copy_video_asset=args.storage_copy_video,
        )
        storage = create_storage(storage_config)
        storage_result = storage.store(
            storyboard=storyboard,
            render_payload=render_payload,
            manifest=manifest,
            render_response=render_response,
        )

    output = {
        'storyboard': storyboard.to_dict(),
        'render_payload': render_payload,
        'manifest': manifest,
        'render_response': render_response,
        'remotionProps': remotion_props,
        'decisions': [asdict(decision) for decision in decisions],
    }

    if storage_result:
        output['storage'] = asdict(storage_result)
    if preferences:
        output['preferences'] = asdict(preferences)

    print(json.dumps(output, indent=2))


if __name__ == '__main__':
    main()
