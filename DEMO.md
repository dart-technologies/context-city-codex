# Demo Runbook

## 60-Second Pitch
Traveling in a new city should feel effortless — but right now, tourists juggle Google Maps, Yelp, Eventbrite, and translation apps.

Our project is a Context-Aware City Concierge, powered by Codex, fronted by Dartagnan the Doodle—our friendly tour guide who narrates every step with the Codex as his trusty copilot.

It’s an agentic AI that knows where you are, what’s happening, and speaks your language. It doesn’t just answer — it plans, books, guides, and for every recommended POI it pulls in all relevant social feeds to stitch a delightful highlight video summary in your local language so you can feel the vibe before you arrive.

Imagine the World Cup Final in New York: La Roja supporters from Madrid and Les Bleus faithful from Paris land in Manhattan. In seconds, Dartagnan pops up with a tail-wagging greeting while the concierge streams a Spanish highlight reel for Mercado Little Spain, flips to a French reel for the Liberty State Park Fan Festival, then stitches breakfast, tapas, and watch-party stops into one itinerary before guiding them by NJ Transit to MetLife Stadium.

The magic? Multi-language, real-time events, social highlight reels, and local transit — all context-aware.

Today, we’ll demo how our concierge takes a tourist from “Plan my day” to “Book my table” to “Guide me to the stadium” in one seamless flow.

This is how we turn New York into a smart, welcoming city — for the World Cup, and for every visitor after.

## 60-Second Demo Script
- **Pre-roll**: Follow the [Live Service Connection Playbook](docs/live_connection_playbook.md) to ensure Expo is pointed at the Highlights API and GPT-powered manifests.
- **0-10s**: Launch Expo (simulator or device) with `EXPO_PUBLIC_API_BASE_URL` set. Dartagnan greets the traveler; Codex Whisper plays the Spanish Mercado Little Spain reel live from the Highlights API. Narration bubble reflects GPT concierge cues.
- **10-20s**: Open the rationale drawer; confirm the API-sourced “Why Codex chose this” data (engagement, proximity, accessibility) is visible.
- **20-30s**: Tap the “Plan” toggle to expand the concierge tray. Walk through the itinerary steps (Plan itinerary → Book now → Guide me → Celebrate), calling out multi-language descriptions and GPT-authored accessibility notes.
- **30-40s**: Trigger “Book now”; show mock confirmation flow and mention how the API would call the booking agent (no live booking for the demo).
- **40-50s**: Hit “Guide me”; surface bilingual NJ Transit guidance and mention live feeds (service alerts) the Highlights API would incorporate.
- **50-60s**: Switch locales via reel dropdown (Spanish ↔ French) to demonstrate localized audio descriptions and captions. Close with “Celebrate” CTA and highlight telemetry/feedback logging (check Highlights API console for `telemetry.received` / `feedback.received`).

> Prep asset: `assets/codex/dartagnan.png` (Dartagnan portrait) for on-screen cameos.
