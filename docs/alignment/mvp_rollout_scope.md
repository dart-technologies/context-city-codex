# MVP rollout scope: World Cup Spain vs. France demo

> "One Codex to guide 'em all" means the hackathon reel must feel like a single trusted whisper from itinerary kickoff to celebration.

## Purpose
This document locks the scope for the Spain vs. France World Cup final demo and captures the assumptions the team will rely on to tell the Codex story end to end. Use it to validate backlog completion, align partner stubs, and brief reviewers ahead of expo sessions.

## Demo pillars
- **Narrative spine:** Traveler asks the Codex to orchestrate match day in New York; Dartagnan delivers guidance beats (`Plan → Book → Guide → Celebrate`) without breaking character.
- **Multilingual reach:** English is default, with instant Spanish and French toggles for every user-facing touchpoint (captions, transcripts, CTA copy, rationale beats).
- **Transparency:** Every highlight, itinerary hop, and CTA is justified via Codex rationale cards backed by decision logs.
- **Resilience:** iPhone demo runs on preloaded data with graceful degradation (transcript + key frames) when video bandwidth is throttled.

## Supported POIs & assets
| POI | Demo objective | Required assets | Mocks / data notes |
| --- | -------------- | --------------- | ----------------- |
| Mercado Little Spain | Warm-up breakfast and pre-match vibe check | Highlight reel (EN/ES/FR), crowd sentiment badges, menu snippet | Use staged social clips cleared via fair-use; crowd sentiment seeded from knowledge graph heuristics |
| Liberty State Park Fan Festival | Midday fan gathering with live activities | Video reel + transcript, live schedule ticker, accessibility flags | Event schedule cached from PR Newswire release; accessibility flags baked into knowledge graph fixtures |
| Felix in SoHo | Reservation anchor for celebratory dinner | Photo carousel fallback, booking CTA, Codex rationale for curated menu | Mock Resy API returns confirmation payload with provenance metadata |
| MetLife Stadium | Match destination and transit hub | Transit plan overlay, Dartagnan guidance cues, safety advisory snippet | GTFS-RT snapshots for MTA + NJ Transit frozen 12 hours prior; safety advisory simulated JSON |

## Platform and locale focus
- **Device target:** iPhone 14/15 Pro running iOS 17 via Expo Go; ensure lightning-to-HDMI output for judges.
- **Form factor:** Portrait-first experience with adaptive layout for 6.1" display; safe-area insets honored.
- **Locales:** `en-US` baseline; `es-ES` and `fr-FR` bundles preloaded. Locale swap occurs at top of reel and propagates to itinerary + feedback widget.
- **Accessibility:** VoiceOver labels localized; captions include speaker tags; haptic nudge triggered when the Codex shifts beats.

## Data and integration assumptions
- **Social signals:** Data365 sandbox keys issued; ingest limited to 24-hour window per POI. Cache responses in `services/orchestrator/fixtures/social/`.
- **Transit feeds:** MTA GTFS-RT and NJ Transit advisories consumed from stored JSON snapshots; ferry schedule curated manually.
- **Partner APIs:**
  - Booking: Mock Resy endpoint served from `services/orchestrator` with audit logging stub.
  - Ticketing: SeatGeek sample data used for stadium seating context (non-interactive).
  - Safety: Vision API moderation replaced by pre-reviewed asset list; flag states mapped to Codex rationale copy.
- **Telemetry:** Demo records analytics locally (no external network). Events replayed in post-demo narrative deck.

## Success criteria
- 60-second walkthrough hits all four Dartagnan beats with zero network dependency.
- Rationale drawer surfaces three distinct reasons (proximity, accessibility, hype) per POI in the selected locale.
- Booking CTA logs provenance ID and displays confirmation toast in user language within two taps.
- Transit guidance offers subway + ferry + rideshare fallback, including accessible route mention.
- Post-match celebration prompt references Liberty State Park festivities and alternative quiet option.

## Risks and mitigations
- **Locale drift:** Mitigate by snapshot-testing translation bundles before demo freeze.
- **Video hiccups:** Ship compressed MP4 + key-frame thumbnails; automatically downgrade to transcript after 3 buffering events.
- **Partner API surprises:** Keep mock services bundled with repo; document manual reset flow in runbook.
- **Device variance:** Rehearse on both physical iPhone and Xcode simulator to catch layout regressions.

## Open tasks
- [ ] Import social clip fixtures into asset store with provenance notes.
- [ ] Finalize GTFS snapshot timestamps and document refresh cadence in runbook.
- [ ] Record Dartagnan voice lines for celebration beat in Spanish and French.
- [ ] Validate telemetry replay script for demo debrief.
