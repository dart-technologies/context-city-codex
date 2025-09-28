# Demo Runbook

## 60-Second Pitch
Traveling in a new city should feel effortless — but right now, tourists juggle Google Maps, Yelp, Eventbrite, and translation apps.

Our project is a Context-Aware City Concierge, powered by Codex, fronted by Dartagnan the Doodle—our friendly tour guide who narrates every step with the Codex as his trusty copilot.

It’s an agentic AI that knows where you are, what’s happening, and speaks your language. It doesn’t just answer — it plans, books, guides, and for every recommended POI it pulls in all relevant social feeds to stitch a delightful highlight video summary in your local language so you can feel the vibe before you arrive.

Imagine the World Cup Final in New York: La Roja supporters from Madrid and Les Bleus faithful from Paris land in Manhattan. In seconds, Dartagnan pops up with a tail-wagging greeting while the concierge streams a Spanish highlight reel for Mercado Little Spain, flips to a French reel for the Liberty State Park Fan Festival, then stitches breakfast, tapas, and watch-party stops into one itinerary before guiding them by NJ Transit to MetLife Stadium.

The magic? Multi-language, real-time events, social highlight reels, and local transit — all context-aware.

Today, we’ll demo how our concierge takes a tourist from “Plan my day” to “Book my table” to “Guide me to the stadium” in one seamless flow.

This is how we turn New York into a smart, welcoming city — for the World Cup, and for every visitor after.

## 90-Second Demo Script
- **Pre-roll**: Follow the [Live Service Connection Playbook](docs/live_connection_playbook.md). If the live API is flaky, remove `EXPO_PUBLIC_API_BASE_URL` to run on MSW mocks (they now include localized reels and narration).
- **0-15s**: Launch Expo. Show the Support + Language pickers (select France → Français). Press Play—Dartagnan overlay captions are in French, and the video is the localized Felix reel.
- **15-30s**: Toggle the Language dropdown to English, then Spanish. Highlight the quick localized reload (Metro shows the cue locale logs). Mention the matching narration WAV.
- **30-45s**: Scroll to the compact Itinerary card. Call out how step labels/descriptions adapt to locale. Point at the rationale card (“Why the Codexierge chose this”).
- **45-60s**: Open the rationale drawer—show telemetry logs in Metro/API console. Submit “helpful feedback” and call out expected mock response.
- **60-75s**: Open the Dartagnan overlay (Plan itinerary → Celebrate). Note localized speech bubble text lined up with `codexiergeCues`.
- **75-90s**: Mention the Remotion reels: three outputs with localized narration, subtitles, and new stills (felix-rooftop/liberty-fan-fest). Close with guidance on viewing the Remotion outputs or playing the MP4s we bundled in `apps/mobile/assets/codex/`.

> Prep asset: `assets/codex/dartagnan.png` (Dartagnan portrait) and the three `apps/mobile/assets/codex/felix-*.mp4` for showcase clips.
