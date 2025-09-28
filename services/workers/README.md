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

## Codexierge dialogues

The narrative pipeline now emits Dartagnan-ready dialogue for English, Spanish, and French locales. The CLI output includes a `codexierge` map keyed by locale.

Add `--storage-output-dir <path>` to control where manifests/payloads land locally and supply `--storage-base-url https://storage.googleapis.com/<bucket>` to fabricate signed URL placeholders for demo hand-offs. Use `--storage-provider none` to skip persistence when benchmarking.

Generate localized narration + subtitles while running the CLI (saved for Remotion fallback or other pipelines):

```bash
poetry run content-workers demo \
  --input fixtures/sample_assets.json \
  --frame-sample-size 2 \
    --voiceover-locales en,es,fr \
  --voiceover-audio-prefix https://cdn.contextcity.dev/audio \
  --remotion-props-output /tmp/codex-remotion.json
```

Provide local art by adding `--remotion-media-dir services/remotion-pipeline/public/assets` (the CLI swaps each asset URL with a matching filename). Place royalty-free JPG/PNG files such as `asset-1.jpg` and `asset-2.jpg` in that folder before rendering to avoid remote fetch errors.


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

