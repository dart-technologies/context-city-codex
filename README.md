# ContextCity Codex Concierge

This repository houses the hackathon build for the **GPT-5 Startup Hackathon NYC**, showcasing "ContextCity: One Codex to guide 'em all".

## What We're Building
- **Context-aware city concierge** centered on the Spain vs. France World Cup final in NYC.
- Dartagnan the Doodle fronts the experience while GPT-5 Codex curates multi-language social highlight reels, itineraries, and bookings.
- Remotion renders localized MP4 reels (FR/EN/ES) with matching narration; Expo consumes them alongside Codex rationale, itinerary map card, and concierge overlay cues.
- All work is open source for hackathon verification; no pre-existing code.

## 🎥 Demo Video
- Watch the end-to-end concierge flow here: [ContextCity Codex Concierge Demo](https://youtube.com/shorts/XryFMA-IeTg).

## Key Docs
- `FEATURE_SOCIAL_FEEDS.md` – full feature spec and hackathon scenario.
- `TODO.md` – engineering backlog tuned for the event weekend.
- `AGENTS.md` – contributor guide.
- `DEMO.md` – 60-second pitch and live demo script.

## Getting Started
1. Clone the repo during the hackathon window.
2. Install dependencies with `yarn install` (JS) and `poetry install` (Python) once code scaffolding lands.
3. Follow `TODO.md` to stand up the concierge MVP.

## Hackathon Notes
- Judges: expect live demos, not slides.
- Submission: upload a 1-minute demo video with repo link.
- All commits should land during the event and reference hackathon tasks.

Let's show how Codex can guide every visitor with one friendly concierge.

## Services
- `services/highlights-api`: Node API serving highlight narratives.
- `services/workers`: Python intelligence workers feeding the app.
- `services/remotion-pipeline`: Remotion fallback renderer for Codex highlight reels.
