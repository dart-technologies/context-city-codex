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
