# ContextCity Content Intelligence Workers

Python workers that filter, rank, and summarize social assets for the Codex. These utilities map to the Content Intelligence backlog in `TODO.md` and can be orchestrated from the highlights API or other services.

## Getting started

```bash
cd services/workers
poetry install
poetry run pytest
```

To run the CLI sampler:

```bash
poetry run content-workers demo --input fixtures/sample_assets.json
```

## Video assembly prototype

Dry-run the Creatomate payload builder (prints storyboard, render payload, and manifest):

```bash
poetry run content-workers render \
  --input fixtures/sample_assets.json \
  --creatomate-template-id tmpl-123 \
  --poi-id poi-felix \
  --poi-name "Felix Rooftop" \
  --poi-tags soccer,fans
```

Execute a real render by adding your API key (stored securely, e.g., `export CREATOMATE_API_KEY=...`):

```bash
poetry run content-workers render \
  --input fixtures/sample_assets.json \
  --creatomate-template-id tmpl-123 \
  --poi-id poi-felix \
  --creatomate-api-key "$CREATOMATE_API_KEY" \
  --creatomate-execute
```

Export Remotion props (offline renderer fallback) while running the CLI:

```bash
poetry run content-workers demo \
  --input fixtures/sample_assets.json \
  --frame-sample-size 2 \
  --remotion-props-output /tmp/codex-remotion.json
```

## Summarization

Use a custom summarizer by passing provider options. The default uses a static template.

```bash
poetry run content-workers demo --input fixtures/sample_assets.json --summarizer static
```

To wire an HTTPS summarization adapter, supply `--summarizer screenapp --summarizer-endpoint <url> --summarizer-api-key <key>`.

## Narrative scripts

Supply GPT-driven scripts via:

```bash
poetry run content-workers demo \
  --input fixtures/sample_assets.json \
  --script-generator gpt \
  --script-endpoint https://api.example.com/scripts \
  --script-api-key $API_KEY
```

Without configuration the CLI uses the static three-beat script generator.

## Localization workflow

The CLI now batches captions, rationale, and script beats through a GPT-5 translation service. Configure it by exporting env vars or passing explicit flags:

```bash
export CODEX_TRANSLATION_ENDPOINT="https://api.context.city/translate"
export CODEX_TRANSLATION_API_KEY="<gpt-key>"

poetry run content-workers demo \
  --input fixtures/sample_assets.json \
  --voiceover-locales en,es,fr \
  --translator gpt
```

You can also override settings inline (`--translation-endpoint`, `--translation-api-key`, `--translation-timeout`, `--translation-max-attempts`). When the endpoint is absent, the CLI falls back to a static translator that labels localized strings with the requested locale—useful for offline demos and tests.

### Accessibility assets

Generate captions, audio descriptions, haptic cues, and alt-text fallbacks directly from the narrative output. Configure the GPT-backed generator the same way:

```bash
export CODEX_ACCESSIBILITY_ENDPOINT="https://api.context.city/accessibility"
export CODEX_ACCESSIBILITY_API_KEY="<gpt-key>"

poetry run content-workers demo \
  --input fixtures/sample_assets.json \
  --voiceover-locales en,es,fr \
  --accessibility-generator gpt
```

Without credentials, the CLI synthesizes demo-friendly accessibility copy using heuristics so Remotion and Expo fallbacks always have something to surface.

## Codexierge dialogues

The narrative pipeline now emits Dartagnan-ready dialogue for English, Spanish, and French locales. The CLI output includes a `codexierge` map keyed by locale.

Add `--storage-output-dir <path>` to control where manifests/payloads land locally and supply `--storage-base-url https://storage.googleapis.com/<bucket>` to fabricate signed URL placeholders for demo hand-offs. Use `--storage-provider none` to skip persistence when benchmarking.

Provide local art by adding `--remotion-media-dir services/remotion-pipeline/public/assets` (the CLI swaps each asset URL with a matching filename). Place royalty-free JPG/PNG files such as `asset-1.jpg` and `asset-2.jpg` in that folder before rendering to avoid remote fetch errors.

### TTS + Remotion props

Enable GPT-5 narration synthesis by configuring the new TTS generator:

```bash
export CODEX_TTS_ENDPOINT="https://api.context.city/tts"
export CODEX_TTS_API_KEY="<gpt-key>"
export CODEX_TTS_DEFAULT_VOICE="dartagnan-en"
export CODEX_TTS_VOICE_FR="dartagnan-fr"
export CODEX_TTS_VOICE_ES="dartagnan-es"

poetry run content-workers demo \
  --input fixtures/sample_assets.json \
  --frame-sample-size 2 \
  --voiceover-locales en,es,fr \
  --tts-generator gpt \
  --voiceover-audio-prefix https://cdn.contextcity.dev/audio \
  --remotion-props-output /tmp/codex-remotion.json
```

When the TTS endpoint is unavailable, the CLI falls back to silence and still emits subtitle maps so Remotion/Expo remain consistent.

## Preference inference microservice

Run the lightweight FastAPI wrapper that calls GPT-5 to infer language and accessibility preferences:

```bash
poetry run uvicorn context_workers.api:app --reload --port 8082
```

Set the upstream GPT endpoint and key before starting (these match the CLI env vars):

```bash
export CODEX_PREFERENCES_ENDPOINT="https://api.context.city/preferences"
export CODEX_PREFERENCES_API_KEY="<gpt-key>"
```

POST `http://localhost:8082/preferences` with `{ "profile": { ... } }` to receive the same payload the CLI consumes. The service shares the coercion logic used by `detect_preferences`, so callers can swap between the HTTP endpoint and the in-process helper without code changes.


### Google Cloud Storage

To mirror the production publish path, point the renderer at a GCS bucket (requires `google-cloud-storage` in your Poetry environment):

```bash
poetry add google-cloud-storage  # one-time dependency install
poetry run content-workers render \
  --input fixtures/sample_assets.json \
  --creatomate-template-id tmpl-123 \
  --poi-id poi-felix \
  --storage-provider gcs \
  --storage-gcs-bucket codex-reels-demo \
  --storage-gcs-prefix world-cup \
  --storage-gcs-credentials path/to/service-account.json \
  --storage-copy-video \
  --storage-signed-url-ttl 86400
```

This uploads manifests, payloads, and (optionally) the rendered MP4 into `gs://codex-reels-demo/world-cup/poi-felix/<render-id>/` and returns signed URLs for the concierge layer.
