# Backend Integration Checklist

This guide tracks the work required to stand up the `/api/highlights/:poiId` endpoint so the Expo client can replace mock data with live responses.

## 1. Service Contract
- Refer to `docs/api/highlights_contract.md` for the request/response shape.
- Expected base URL: `${EXPO_PUBLIC_API_BASE_URL}/api/highlights/:poiId` (the app reads `EXPO_PUBLIC_API_BASE_URL` from Expo config at runtime).

## 2. Implementation Steps (Codex Orchestrator Team)
- [x] Add REST handler that accepts `poiId` and optional `locale`; hydrate data from Codex fetch-plan results.
- [x] Populate `summary`, `narrative`, `rationale`, `conciergeCues`, and `itinerary` fields as described.
- [x] Attach provenance metadata (source handles, last_updated) for audit logging.
- [x] Return 404 on unknown POIs, 503 when upstream aggregators fail.
- [x] Cache responses for 120 seconds and emit ETags for client revalidation.
- [x] Emit structured telemetry (`highlight.fetch.success`, `highlight.fetch.failure`) with request IDs for client correlation.

## 3. Infrastructure Notes
- [x] Endpoint will be called from the Expo app; enable CORS for app bundle origins.
- [x] Ensure authentication/ratelimiting strategy aligns with hackathon constraints (public demo with read-only access token recommended).
- [x] Log requestId and decisionLog IDs for traceability.
- [x] Configure `EXPO_PUBLIC_API_BASE_URL` in the Expo runtime (via `app.config.js` or `app.json`) so the mobile app hits the correct host. Example snippet:
  ```js
  // app.config.js
  export default ({ config }) => ({
    ...config,
    extra: {
      ...config.extra,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    },
    expo: {
      ...config.expo,
      extra: {
        ...config.expo?.extra,
        apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      },
    },
  });
  ```

## 4. Validation
- [x] Provide sample curl commands against staging endpoint (`/api/highlights/poi-felix`). For example:
  ```bash
  curl -H "Accept: application/json" \
    "$EXPO_PUBLIC_API_BASE_URL/api/highlights/poi-felix?locale=fr"
  ```
- [x] Share expected JSON payload for QA; compare with `apps/mobile/src/mocks/poi-felix.json`.
- [x] Run Expo app with `EXPO_PUBLIC_API_BASE_URL` set (e.g., via `app.config.js`) and confirm highlights load without mock fallback.
- [x] Confirm decision logs and telemetry emitted by the service show up in monitoring dashboards.

- Base URL: `http://localhost:8080` (or deployed equivalent) shared with the mobile team.

## 5. Deliverables Back to Mobile Team
- [x] Base URL to configure.
- [x] Any authentication headers or query params.
- [x] SLA on refresh cadence to align prefetch strategy.
