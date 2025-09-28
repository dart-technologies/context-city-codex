# TODO: Social Feed Highlight Video Feature
> "One Codex to guide 'em all."

This backlog aligns implementation work with the updated ContextCity Codex spec in `FEATURE_SOCIAL_FEEDS.md`.

## Alignment & Foundations

- [x] Review knowledge graph contracts, social signal aggregator SLAs, and licensing constraints. (See docs/alignment_foundations.md)
- [x] Confirm privacy, governance, and audit requirements with Trust & Safety.
- [x] Define MVP rollout scope (supported POI types, locales, and device targets). (See docs/alignment/mvp_rollout_scope.md)
- [x] Lock World Cup Spain vs. France scenario assumptions (venues, transit feeds, partner APIs). (See docs/alignment/mvp_rollout_scope.md)

## Hackathon Concierge Narrative

- [x] Author Dartagnan the Doodle persona guidelines and integrate voice/tone samples.
- [x] Curate POI shortlist (Mercado Little Spain, Liberty State Park Fan Festival, Felix in SoHo, MetLife Stadium) with metadata and social feed filters.
- [x] Map day-of timeline triggers (plan request, booking, transit, celebration) to Codex agent actions.

## Experience Layer (Expo + TypeScript)

- [x] **Social Highlights entry point**
    - [x] Inject "Codex Whisper" card on the POI detail screen with shimmer, fallback, and constrained-mode states. *(Implementation plan: `docs/experience_layer_plan.md` §1)*
    - [x] Implement accessibility-compliant preview tile and CTA pill layout.
- [x] **Immersive reel player**
    - [x] Build full-screen player with transcript toggle, related POI pill, and rationale drawer. *(Plan: `docs/experience_layer_plan.md` §2)*
    - [x] Handle autoplay, replay, and degradation to transcript + imagery when bandwidth is low.
- [x] **Codex rationale surfaces**
    - [x] Render "Why the Codex chose this" card pulling from decision log metadata. *(Plan: `docs/experience_layer_plan.md` §3)*
    - [x] Wire user feedback widget to Trust & Stewardship API (client posts to `/api/feedback`).
    - [x] Instrument rationale view telemetry and governance guardrails. (See apps/mobile/src/screens/PoiDetailScreen.tsx)
- [x] **Dartagnan concierge overlay**
    - [x] Add Dartagnan avatar component with localized captions and sign-off animations. *(Plan: `docs/experience_layer_plan.md` §4)*
    - [x] Surface Codex-generated itineraries in a timeline view with booking CTAs.

## Codex Orchestrator Service (Node.js/TypeScript)

- [x] Implement fetch-plan builder that merges POI metadata, user context, and signal aggregator queries. (Highlights API wired; see services/highlights-api/src/server.js)
- [x] Emit structured decision logs with rationale snippets and content provenance metadata. (Highlights API delivers rationale & metadata)
- [x] Enforce governance policies (brand tone, privacy filters, personalization opt-outs) before dispatching work. (Mobile governance audit integrated with API response)
- [x] Publish telemetry hooks for engagement metrics and content lifecycle states. (Telemetry endpoints required; /api/telemetry fallback added)
- [x] Generate multi-stop itineraries that consider transit disruptions and booking availability. (See services/highlights-api/data/highlights/poi-felix.json itinerary)
- [x] Expose API for Dartagnan narration cues (greeting, transition, farewell). (Highlights API returns conciergeCues)

## Content Intelligence Workers (Python)

- [x] **Filtering & ranking**
    - [x] Apply moderation filters, dedupe clusters, and score assets using heuristics defined in the spec. (See services/workers/src/context_workers/filtering.py)
- [x] **Highlight extraction**
    - [x] Integrate summarization APIs (ScreenApp/api.video or Remotion workflows) and scene labelling. (Summarizer + scene labeller in services/workers/src/context_workers)
    - [x] Capture caption/comment text for narration fodder and provenance. (Narrative assembly uses asset captions)
- [x] **Narrative assembly**
    - [x] Invoke GPT-5 for three-beat scripts with lore references and related POI recommendations. (Script generators in services/workers/src/context_workers/narrative.py)
    - [x] Persist asset provenance links for compliance checks. (Narrative provenance attached in extraction output)
- [x] **Concierge storytelling**
    - [x] Produce multi-language scripts (English, Spanish, French) aligned with Dartagnan persona beats. (Codexierge output integrated into mobile UI)
    - [x] Create rationale snippets for "Why Codex chose this" surfaces and itinerary transitions. (Generated via context_workers.extraction)

## Demo Recording (Mock Path)

- [x] Freeze highlight JSON + narration assets in `services/highlights-api/data/highlights` before capture.
- [x] Launch Expo without `EXPO_PUBLIC_API_BASE_URL` so MSW mocks stay active (`yarn expo start` from repo root).
- [x] Smoke the mock flow: load all POIs, toggle transcripts/locales, trigger feedback + telemetry, verify Metro only logs mock fetch fallbacks.
- [x] Record the walkthrough (Immersive reel, itinerary route card, rationale card, Dartagnan overlay, accessibility drawer) following the hackathon narrative.
- [x] Export/trim the recording and stage supporting screenshots for README/submission deck.

## Video Assembly Pipeline

- [x] Create reusable Remotion or managed-service templates with ContextCity branding (glassmorphism Remotion kit with ContextCity palette + Dartagnan styling).
- [x] Prototype Creatomate render payload builder and CLI dry-run flow.
- [x] Overlay metadata callouts (distance, hours, tags) sourced from the knowledge graph (wired into Creatomate payload builder).
- [x] Generate machine-readable manifests describing asset sources, accessibility coverage, and Codex confidence scores (see Creatomate manifest output).
- [x] Store final renditions in Cloud Storage with signed URL distribution paths (CLI now supports GCS uploads + signed URLs with optional video copy).
- [x] Scaffold Remotion fallback renderer for offline demos.
- [x] Produce highlight reels for each featured POI with localized voiceovers and subtitle tracks (CLI now emits per-locale subtitles + narration manifests for Remotion/Creatomate).

## Localization & Accessibility

- [x] Detect language and accessibility preferences from Codex profiles using GPT-5 signals and conversations (CLI now calls preference service with GPT-5 fallback heuristics offline; Content Workers emit locale cues for downstream use).
- [x] **P0** Automate translation of captions, on-screen text, and scripts purely via GPT-5 prompts and evaluation loops (Content Workers call GPT-5 translation service with fallback heuristics and persist per-locale bundles).
- [x] **P0** Produce captions, audio descriptions, haptic cues, and alt-text-only fallbacks for low-bandwidth scenarios using GPT-5 authored assets (Content Workers author accessibility bundles per locale and feed Remotion/Expo fallbacks).
- [x] Integrate GPT-5 TTS hooks in content workers and Remotion props (env-driven) so localized narration assets populate the mobile demo.
- [ ] **P1** Validate localized voiceovers via GPT-5 speech synthesis / review and ensure transcripts sync across locales (iterate through Codexierge script beats and narration manifests).
- [ ] **P1** QA Spanish and French itinerary flows, including Dartagnan captions and GPT-5 generated TTS output (exercise Expo demo path with localized assets).
- [ ] **P1** Wire Expo concierge to play GPT-authored audio descriptions and trigger haptic cues in the live build once endpoints are provisioned.

## Trust & Stewardship Controls

- [ ] Integrate safety filters (Vision API, policy rules) ahead of assembly.
- [ ] Maintain attribution ledger with creator handles, license terms, and retention windows.
- [ ] Respect personalization opt-out flows by delivering neutral highlight reels.
- [ ] Automate privacy scrubbing and retention policies for telemetry signals.
- [ ] Log all Dartagnan interactions with rationale provenance for audit review.

## Observability & Feedback Loops

- [ ] Instrument fetch success, rejection rate, localization SLA, and end-to-end latency metrics (OpenTelemetry).
- [ ] Build dashboards in Grafana/Lighstep for Codex Ops.
- [ ] Ship feedback widget events to Trust & Safety for triage; measure time-to-resolution.
- [ ] Capture rationale card impressions/taps for Trust & Stewardship metrics.
- [ ] Track itinerary completion, booking conversions, and language preference splits during the hackathon demo.

## AI Workflow Enablement (GPT-5 / GPT-5-Codex)

- [ ] Configure prompt templates and safety rails for narration and translation tasks.
- [ ] Run offline evaluation set to assess lore accuracy and sentiment alignment.
- [ ] Use GPT-5-Codex to generate boilerplate for orchestration and worker services, keeping human-in-the-loop review.
- [ ] Fine-tune prompt variants for Dartagnan voice, including greeting, guidance, and farewell states.

## Outstanding Decisions

- [ ] Choose between Remotion pipelines vs. managed video assembly services for MVP.
- [ ] Define rubric for when the Codex explicitly explains curation choices vs. relying on implicit guidance.
- [ ] Confirm minimum dataset for new POIs and fallback behavior when external signals are thin.
- [ ] Decide how Dartagnan avatar appears across mobile and web (static art vs. lightweight animation).
