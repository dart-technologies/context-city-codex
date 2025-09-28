# Deploy Highlights API to Vercel

Follow these steps to run the Social Highlights API on Vercel’s serverless platform so the Expo app can hit a public endpoint.

## 1. Prerequisites

- Vercel CLI installed: `npm install -g vercel`
- A Vercel account and project (create one via `vercel login`)
- Repo checked out locally with access to `services/highlights-api`

## 2. Prepare Environment Variables

The API writes feedback/telemetry logs to `/tmp/feedback.log` by default on Vercel. Override the highlight dataset or log location by setting:

- `HIGHLIGHTS_DIR` → absolute path within the repo or an attached storage mount
- `FEEDBACK_LOG_PATH` → target file path (e.g., `/tmp/feedback.log`)

You can configure these in the Vercel dashboard under **Settings → Environment Variables**.

## 3. Link the Project

From the repo root:

```bash
vercel link
```

Respond to the prompts to create or link an existing Vercel project. The CLI uses `vercel.json` for configuration.

## 4. Deploy

Install the API dependencies and deploy:

```bash
# One-time local install (optional but helps with type checks)
(cd services/highlights-api && npm install)

# Deploy to Vercel preview environment
vercel

# Deploy to production
vercel --prod
```

The build uses the root `vercel.json`, which runs `npm install --prefix services/highlights-api` so Express/cors/morgan are bundled with the serverless catch-all function at `api/[...route].mjs`.

## 5. Smoke Test

After deployment, verify the endpoints:

```bash
curl https://<your-vercel-domain>/api/highlights/poi-felix
curl -X POST https://<your-vercel-domain>/api/feedback \
  -H 'Content-Type: application/json' \
  -d '{"highlightId":"poi-felix","wasHelpful":true}'
```

You should see 200/202 responses and corresponding `highlight.fetch.success` / `feedback.received` logs in the Vercel dashboard (Functions tab → Logs).

## 6. Point Expo at Vercel

Restart the Expo app with the public base URL:

```bash
EXPO_PUBLIC_API_BASE_URL=https://<your-vercel-domain> yarn expo start
```

The mobile client now bypasses the local mocks and speaks directly to the Vercel deployment.

## 7. Maintenance Notes

- Vercel serverless storage is ephemeral. For persistent feedback/telemetry, forward entries to an external store (Supabase, Turso, S3, etc.).
- Update `services/highlights-api/data/highlights` and redeploy whenever highlight JSON changes.
- Use `vercel env pull` to sync env vars locally for debugging.

With these steps the Highlights API stays in sync with the live reel experience for demos and production. Local development via `npm run dev` is unaffected.
