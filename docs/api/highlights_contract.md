# Highlights API Contract

Endpoint: `GET /api/highlights/:poiId`

## Request
- `poiId` — POI identifier matching the ContextCity knowledge graph (e.g., `poi-felix`).
- Headers: `Accept: application/json`
- Optional query string: `locale=fr` (used for server-side narration selection).

## Response (200 OK)
```json
{
  "summary": {
    "id": "poi-felix",
    "title": "Felix in SoHo",
    "previewUrl": "https://…",
    "locale": "fr",
    "tagline": "Codex spotted vibrant French celebrations for the final.",
    "ctas": ["plan", "book", "guide"]
  },
  "narrative": {
    "id": "poi-felix",
    "videoUrl": "https://…/felix.mp4",
    "transcript": {
      "en": "…",
      "es": "…",
      "fr": "…"
    },
    "keyframes": ["https://…frame1.jpg", "https://…frame2.jpg"],
    "relatedPoiIds": ["poi-mercado", "poi-liberty-fanfest"],
    "rationale": {
      "highlightId": "poi-felix",
      "reasons": [
        { "id": "vibe", "label": "Electric fan vibe", "icon": "⚡", "description": "…" }
      ],
      "metadata": {
        "distance": "0.4 mi",
        "last_updated": "2025-07-18T18:22:00Z"
      }
    },
    "conciergeCues": [
      { "step": "GREETING", "locale": "fr", "caption": "…", "durationMs": 3500 }
    ],
    "itinerary": [
      { "id": "plan", "label": "Plan itinerary", "description": "…", "action": "plan" }
    ]
  }
}
```

## Error Responses
- `404 Not Found` — Unknown `poiId`.
- `429 Too Many Requests` — Rate limit exceeded (mirrors social signal aggregator policy).
- `500 Internal Server Error` — Upstream fetch failure (include `requestId`).

## Notes
- Payload should be cacheable for 2 minutes (Cloud CDN) with ETag support.
- `conciergeCues` duration defaults to 4s if omitted; `itinerary` defaults to Codex fallback plan.
- All URLs must be HTTPS and accessible from Expo runtime.
- Provide provenance metadata per asset in `rationale.metadata` to enable audit trail.
