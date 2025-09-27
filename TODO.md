# TODO: Social Feed Highlight Video Feature
> "One Codex to guide 'em all."

This backlog aligns implementation work with the updated ContextCity Codex spec in `FEATURE_SOCIAL_FEEDS.md`.

## Alignment & Foundations

- [ ] Review knowledge graph contracts, social signal aggregator SLAs, and licensing constraints.
- [ ] Confirm privacy, governance, and audit requirements with Trust & Safety.
- [ ] Define MVP rollout scope (supported POI types, locales, and device targets).
- [ ] Lock World Cup Spain vs. France scenario assumptions (venues, transit feeds, partner APIs).

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
- [ ] **Codex rationale surfaces**
    - [x] Render "Why the Codex chose this" card pulling from decision log metadata. *(Plan: `docs/experience_layer_plan.md` §3)*
    - [x] Wire user feedback widget to Trust & Stewardship API (client posts to `/api/feedback`).
- [x] **Dartagnan concierge overlay**
    - [x] Add Dartagnan avatar component with localized captions and sign-off animations. *(Plan: `docs/experience_layer_plan.md` §4)*
    - [x] Surface Codex-generated itineraries in a timeline view with booking CTAs.

## Codex Orchestrator Service (Node.js/TypeScript)

- [ ] Implement fetch-plan builder that merges POI metadata, user context, and signal aggregator queries.
- [ ] Emit structured decision logs with rationale snippets and content provenance metadata.
- [ ] Enforce governance policies (brand tone, privacy filters, personalization opt-outs) before dispatching work.
- [ ] Publish telemetry hooks for engagement metrics and content lifecycle states.
- [ ] Generate multi-stop itineraries that consider transit disruptions and booking availability.
- [ ] Expose API for Dartagnan narration cues (greeting, transition, farewell).

## Content Intelligence Workers (Python)

- [ ] **Filtering & ranking**
    - [ ] Apply moderation filters, dedupe clusters, and score assets using heuristics defined in the spec.
- [ ] **Highlight extraction**
    - [ ] Integrate summarization APIs (ScreenApp/api.video or Remotion workflows) and scene labelling.
    - [ ] Capture caption/comment text for narration fodder and provenance.
- [ ] **Narrative assembly**
    - [ ] Invoke GPT-5 for three-beat scripts with lore references and related POI recommendations.
    - [ ] Persist asset provenance links for compliance checks.
- [ ] **Concierge storytelling**
    - [ ] Produce multi-language scripts (English, Spanish, French) aligned with Dartagnan persona beats.
    - [ ] Create rationale snippets for "Why Codex chose this" surfaces and itinerary transitions.

## Video Assembly Pipeline

- [ ] Create reusable Remotion or managed-service templates with ContextCity branding.
- [ ] Overlay metadata callouts (distance, hours, tags) sourced from the knowledge graph.
- [ ] Generate machine-readable manifests describing asset sources, accessibility coverage, and Codex confidence scores.
- [ ] Store final renditions in Cloud Storage with signed URL distribution paths.
- [ ] Produce highlight reels for each featured POI with localized voiceovers and subtitle tracks.

## Localization & Accessibility

- [ ] Detect language and accessibility preferences from Codex profiles.
- [ ] Automate translation of captions, on-screen text, and scripts (Google Cloud Translation/DeepL + GPT-5 tone check).
- [ ] Produce captions, audio descriptions, haptic cues, and alt-text-only fallbacks for low-bandwidth scenarios.
- [ ] Validate localized voiceovers via TTS and ensure transcripts sync across locales.
- [ ] QA Spanish and French itinerary flows, including Dartagnan captions and TTS output.

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
