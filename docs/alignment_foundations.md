# Alignment & Foundations Worklog

This log captures progress against the alignment checklist prior to building the ContextCity concierge MVP.

## Knowledge Graph & Signal Contracts
- Candidate providers identified: Data365 (Instagram, TikTok, X), Phyllo (multi-network), and NYC & Co events feed. Need to draft outreach emails and verify hackathon-acceptable terms of use.
- Licensing considerations: ensure social clips are limited to public, non-download API usage; highlight that compilations remain non-commercial for hackathon demo.
- Viability notes (public website research):
  - **Data365** documents unified social APIs with short-term trial keys—should support rapid hackathon onboarding, but rate limits (~5k calls/day on trial) may constrain multi-POI ingestion; relies on standard OAuth, so no third-party SDK required.
  - **Phyllo** advertises compliance-first creator API with sandbox mode; requires developer registration and post-approval for production scopes, so plan to operate within sandbox content unless expedited review granted.
  - **NYC & Company** publishes open event datasets via NYC Open Data; CSV/JSON endpoints can be pulled directly without additional contracts, fitting "no third-party" tooling beyond HTTP fetch.
  - **Liberty State Park / NJ sites** share public schedules via state tourism portals; scraping allowed under terms if rate-limited and attributed—confirm before use.
- **Decision (Hackathon demo):** Prefer Codex-operated direct scrapes of POI-owned social links (homepage embeds to Instagram, YouTube, TikTok, X) when terms permit. Aggregator trial keys remain fallback for missing reels, but Codex must cache only metadata + thumbnails and never store raw downloads beyond demo fixtures.
  - Attribute each highlight within a Codex-branded frame that cites the original platform handle and link.
  - Document robots.txt and terms-of-service checks for every POI before enabling scrapes.
- Action items:
  - [ ] Compile rate limits and pricing docs for Data365 vs. Phyllo. *(Owner: Alex)*
  - [ ] Confirm attribution requirements for Liberty State Park fan festival assets and Codex-branded frames. *(Owner: Priya)*
  - [ ] Log robots.txt and terms-of-service clearance for each POI before enabling direct scrapes. *(Owner: Priya + Legal)*
      * Mercado Little Spain — verify `https://www.mercadolittlespain.com/robots.txt` and confirm Instagram embed permissions.
      * Liberty State Park Fan Festival — reference NJ State tourism portal terms for event media reuse; record contact email approval.
      * Felix in SoHo — check `https://www.felix.nyc/robots.txt` (or site equivalent) and Resy press-kit usage policy.
      * MetLife Stadium — cite `https://www.metlifestadium.com/robots.txt` and NFL media guidelines for highlight framing.
  - [ ] Draft email template for requesting temporary hackathon access tokens (fallback aggregators). *(Owner: Alex)*

## Privacy, Governance, and Audit Requirements
- Trust & Safety inputs required on: real-time crowd data usage, Dartagnan persona transparency, storing user preferences.
- Proposed governance artifacts: decision log schema, moderation escalation pathway, telemetry retention (≤30 days during hackathon).
- Action items:
  - [ ] Schedule 30-min sync with Trust & Safety delegate during hackathon kickoff.
  - [ ] Draft governance checklist covering content provenance, audit logging, and personalization opt-outs.

## MVP Rollout Scope
- Target POIs: Mercado Little Spain, Liberty State Park Fan Festival, Felix in SoHo, MetLife Stadium.
- Locales: English baseline plus Spanish and French localization; devices scoped to Expo mobile build.
- Action items:
  - [ ] Define success criteria for concierge flow (plan → book → guide → celebrate) within 60-second demo.
      * Highlight reel must showcase multi-language (Spanish/French) narration and subtitles for Felix in SoHo.
      * Booking step should call a mocked reservation endpoint (no live API) and present provenance logging.
      * Guidance step must surface bilingual NJ Transit + rideshare fallback.
      * Celebration prompt should propose Liberty State Park ferry party with localized copy and Dartagnan sign-off.
  - [ ] List required mock data fixtures for each POI.

## Spain vs. France Scenario Assumptions
- Venues confirmed via PR Newswire reference for Liberty State Park festival.
- Transit feeds: MTA GTFS-RT for subway, NJ Transit bus/rail advisories, ferry schedules.
- Partner APIs: explore SeatGeek or ticketing for MetLife, Resy/OpenTable for Felix in SoHo.
- Action items:
  - [ ] Document fallback plan if live feeds unavailable (cached JSON snapshots).
  - [ ] Gather imagery/short clips for each venue with provenance notes.

Next review checkpoint: prior to implementing orchestrator fetch-plan builder.
