# Live Service Connection Playbook

This checklist captures the steps required to swap the Expo app (and supporting tools) from local mocks to the live Social Highlight services. Complete these tasks before recording the demo or submitting the hackathon entry so the reel experience reflects real APIs and GPT-5 outputs.

## 1. Launch the Highlights API

```bash
cd services/highlights-api
npm install
npm start -- --port 8080
```

- Overrides:
  - `HIGHLIGHTS_DIR` → alternate highlight JSON directory
  - `FEEDBACK_LOG_PATH` → custom feedback/telemetry log file

Confirm console logs like:
```
Highlights API listening on port 8080
```

## 2. Start Expo With a Base URL

Expose the Highlights API to the client (adjust host/IP for simulator vs. device):

```bash
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8080 npx expo start
```

On a physical device, replace `127.0.0.1` with your machine’s LAN IP.

## 3. Gate the Mock Server

In `App.js`, ensure MSW only loads when no base URL is defined:

```js
import { API_BASE_URL } from './src/utils/env';

if (__DEV__ && !API_BASE_URL) {
  require('./src/mocks/server');
}
```

This keeps Jest/dev mocks intact but lets Expo talk to live services when `EXPO_PUBLIC_API_BASE_URL` is provided.

## 4. Verify Highlight Fetch

With Expo running:

- Watch the Highlights API console for `highlight.fetch.success` logs.
- In the app, confirm the reels match the JSON served by the API (`services/highlights-api/data/highlights/poi-felix.json`).

Fallback safety remains in place: if the API is unreachable, `useHighlightSummary` falls back to bundled mock data.

## 5. Exercise Feedback + Telemetry

- Submit feedback from the Codex rationale card; check API logs for `feedback.received` and ensure `feedback.log` updated.
- Trigger player interactions to record telemetry; look for `telemetry.received` in the API console.

## 6. (Optional) Enable GPT Preference/Translation/Accessibility Endpoints

For the content pipeline/CLI:

```bash
export CODEX_PREFERENCES_ENDPOINT=https://...
export CODEX_PREFERENCES_API_KEY=...
export CODEX_TRANSLATION_ENDPOINT=https://...
export CODEX_TRANSLATION_API_KEY=...
export CODEX_ACCESSIBILITY_ENDPOINT=https://...
export CODEX_ACCESSIBILITY_API_KEY=...
```

Running `poetry run content-workers ...` with these set will regenerate highlight manifests that include live GPT locale and accessibility assets. Deploy the updated JSON to the Highlights API before recording.

## 7. Manual Smoke Checklist

- [ ] Highlight load succeeds with no console fallbacks.
- [ ] Feedback POST returns 202; log updated.
- [ ] Telemetry POST returns 202; log updated.
- [ ] Reel audio/captions reflect latest GPT translations.
- [ ] Accessibility drawer shows GPT-authored descriptions and haptic cues.
- [ ] MP4 playback still works offline (disconnect network to confirm fallback).

Once all boxes are ticked, the app is connected to the live pipeline and ready for demo capture/submission.
