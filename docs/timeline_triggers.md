# Day-of Timeline Triggers & Codex Agent Actions

## 1. Plan Request
- **Trigger:** Traveler opens ContextCity app and taps "Plan my World Cup day".
- **Agents:**
  - Codex Orchestrator fetches POI highlights + real-time signals.
  - Dartagnan Greeting Agent plays localized intro.
- **Outputs:** Personalized itinerary card (breakfast → fan fest → transit → stadium).

## 2. Booking Step
- **Trigger:** Traveler taps "Book my table" from Felix in SoHo call-to-action.
- **Agents:**
  - Reservation Agent hits mock Resy endpoint, logs provenance.
  - Dartagnan narrates confirmation in user language.
- **Outputs:** Booking confirmation card + ICS download, audit log entry.

## 3. Guide Step
- **Trigger:** Traveler selects “Guide me” before leaving fan festival.
- **Agents:**
  - Transit Agent pulls MTA GTFS-RT + NJ Transit advisories.
  - Safety Agent checks crowd sentiment for route adjustments.
  - Dartagnan Guidance Agent summarizes accessible options + rideshare fallback.
- **Outputs:** Multi-step directions (subway, ferry, rideshare) with bilingual captions, decision log.

## 4. Celebration Step
- **Trigger:** Match ends; Codex detects final whistle via schedule + social surge.
- **Agents:**
  - Celebration Agent recommends Liberty State Park ferry party + adjacent quieter alternatives.
  - Feedback Agent pops rationale drawer (“Why Codex suggested this”).
  - Dartagnan Farewell Agent delivers sign-off.
- **Outputs:** Celebration card with CTA, user feedback prompt, telemetry event.

## Notes
- All agents must emit structured decision logs for audit + rationale surfaces.
- Timeline should complete ≤60 seconds in demo with pre-fetched data.
