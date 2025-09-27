# ContextCity Highlights API

Lightweight Express server that serves highlight narratives for the concierge MVP.

## Quick Start

```bash
cd services/highlights-api
npm install
npm run dev
```

The service listens on `http://localhost:8080` by default.

## Endpoints

### `GET /api/highlights/:poiId`

Returns the highlight summary and narrative payload for a given POI. Example:

```bash
curl http://localhost:8080/api/highlights/poi-felix
```

#### Query Parameters
- `locale` (optional): Override the preferred narration locale (e.g., `fr`).

#### Responses
- `200 OK`: Highlight payload (see `docs/api/highlights_contract.md`).
- `304 Not Modified`: Returned when `ETag` matches client cache.
- `404 Not Found`: Unknown POI ID.
- `503 Service Unavailable`: Internal failure (payload logged as `highlight.fetch.failure`).

### `POST /api/feedback`

Accepts user feedback for a highlight rationale card.

```bash
curl -X POST http://localhost:8080/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"highlightId":"poi-felix","wasHelpful":true,"context":"Great match pick"}'
```

#### Request Body
- `highlightId` (string, required)
- `wasHelpful` (boolean, required)
- `context` (string, optional)

#### Responses
- `202 Accepted`: Feedback stored (also logged as `feedback.received`).
- `400 Bad Request`: Missing required fields.
- `503 Service Unavailable`: Persistence failure (logged as `feedback.write.failure`).

## Notes
- Payloads are currently served from static JSON files in `data/highlights/` until aggregator wiring is complete.
- Logs emit JSON for easy ingestion (`highlight.fetch.success` events with request IDs).
- Update `data/highlights` with additional POIs as they come online.
