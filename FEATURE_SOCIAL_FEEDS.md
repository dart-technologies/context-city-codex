# ContextCity Feature Spec: Social Feed Highlight Video
> "One Codex to guide 'em all."

## 1. Feature Overview

### 1.1 Description
The Social Feed Highlight Video is a ContextCity codex-powered experience that curates public, location-relevant social media stories into a short-form reel. The Codex orchestrates discovery, relevance scoring, and narration so that every Point of Interest (POI) can be explored through the lens of the community that animates it.

### 1.2 Goal
Deliver a trustworthy, continuously fresh lens on any POI by fusing real-time social signals with the ContextCity knowledge graph. Every highlight video should feel like a guided tour authored by the Codex on behalf of the user.

### 1.3 User Value
* **Authentic preview:** Surfaces lived experiences around a POI instead of static marketing copy.
* **Story-first navigation:** Presents highlights in narrative beats, mirroring a Codex tale the user can follow.
* **Context-aware guidance:** Honors user preferences (language, interests, accessibility needs) already known to the Codex.
* **Discovery accelerant:** Promotes nearby or thematically similar POIs the Codex believes the user will enjoy next.

### 1.4 Narrative Fit
The reel is positioned as a "Codex Whisper" in the ContextCity lore. While the city evolves, the Codex remains the trusted narrator translating the city's pulse into actionable guidance, reinforcing the platform promise: anyone can find their next moment with a single guide.

### 1.5 Codex Tenets
* **One Codex to guide 'em all:** Every surface, copy block, and fallback state must feel authored by the Codex, even when third-party assets drive the visuals.
* **Transparent guardianship:** Users should always understand why a highlight was chosen and how it relates to their journey.
* **Graceful degradation:** When signals are sparse, the experience defaults to lore-grounded storytelling powered by the knowledge graph rather than exposing empty states.

### 1.6 Hackathon MVP Scenario: World Cup Final NYC
For the GPT-5 hackathon, the MVP focuses on Spain vs. France fans arriving in New York. Dartagnan the Doodle greets travelers as the on-screen concierge while the Codex assembles:
* Multi-language highlight reels (Spanish and French) for key POIs such as Mercado Little Spain, the [Liberty State Park Fan Festival](https://www.prnewswire.com/news-releases/one-year-to-go-liberty-state-park-named-official-site-of-fifa-fan-festival-nynj-302479180.html), Felix in SoHo, and MetLife Stadium.
* Real-time transit and crowd signals that adapt itineraries on the fly.
* Booking-ready CTAs that transition effortlessly from previewing a venue to reserving, navigating, and celebrating post-match.

## 2. Technical Specification

### 2.1 Solution Snapshot
```
[User App]
   ↓
[Experience Layer (ContextCity App Shell)]
   ↓
[ContextCity Codex Orchestrator]
   ↓
[Signal Aggregators] ⇄ [Content Intelligence Workers]
                                   ↓
                         [Video Assembly Service]
                                   ↓
                     [Localization & Accessibility]
                                   ↓
                           [Delivery Edge]
                                   ↓
                               [User App]
```

### 2.2 Data Sources & Contracts
* **Social signal aggregators:** Data365, Phyllo, or similar providers delivering Instagram, TikTok, and X content via a single contract; results scoped to POI coordinates, hashtags, and entity handles.
* **ContextCity knowledge graph:** Canonical POI records, relationship edges ("nearby", "vibe", "events"), and user affinity profiles.
* **Telemetry:** In-app engagement events powering feedback loops for future curation.
* **Event & transit feeds:** NYC & Co event APIs, MTA GTFS-RT, NJ Transit advisories, and venue RSVPs that inform itinerary timing.
* **Concierge asset store:** Dartagnan persona prompts, localized scripts, and TTS voicepacks stored with provenance metadata.

### 2.3 Codex Orchestration Layer
* Harmonizes POI metadata, real-time signals, and user context into a single fetch plan.
* Issues task bundles to downstream workers (filtering, highlight detection, narration) and assembles outputs into a structured "Highlight Narrative" object.
* Applies governance rules (safety, brand tone, privacy) before promotion to delivery tier.
* Emits decision logs and rationale snippets that the experience layer can convert into user-facing "why you saw this" moments.
* Dispatches Dartagnan concierge cues (greeting, transition, farewell) synchronized with highlight playback stages.

### 2.4 Content Processing & Intelligence
1. **Filter & Rank**
   * Remove low-quality or policy-violating assets.
   * Score candidates against Codex relevance heuristics: engagement, recency, semantic match to POI archetype, sentiment.
   * Cluster similar assets to avoid redundancy.
2. **Highlight Extraction**
   * Summarize long-form clips via video summarization APIs (ScreenApp, api.video, or Remotion workflows).
   * Run image understanding to label scenes, landmarks, and moods.
   * Extract caption and comment text for narration fodder.
3. **Narrative Assembly**
   * Use GPT-5 to draft a three-beat narration (hook, core, takeaway) referencing Codex lore when appropriate.
   * Link to related POIs or experiences that map to the user's affinity graph.
   * Record provenance of every cited asset so compliance checks can trace back to the underlying signal.
   * Generate synchronized multi-language scripts (English baseline plus Spanish/French for World Cup fans) and Dartagnan voice cues.

### 2.5 Video Assembly & Personalization
* Compose timeline in a programmatic video service (Creatomate, Shotstack, or Remotion) with reusable ContextCity templates.
* Overlay metadata callouts (distance, opening hours, trending tags) pulled from the knowledge graph.
* Layer Codex voiceover (TTS) and adaptive soundtrack chosen from licensed catalog.
* Produce renditions at multiple aspect ratios and bitrates for responsive delivery.
* Attach machine-readable manifests describing content sources, accessibility coverage, and Codex confidence scores for downstream analytics.
* Render Dartagnan overlay animations and itinerary CTAs timed to narrative beats.

### 2.6 Localization & Accessibility
* Detect preferred language and accessibility settings from the Codex profile.
* Translate on-screen text and scripts via Google Cloud Translation or DeepL, with tone adjustments validated by GPT-5.
* Generate captions, audio descriptions, and haptic cues (where supported) before publishing.
* Provide alternate text summaries when media streaming degrades, ensuring accessibility commitments still hold.
* Maintain localized Dartagnan captions and callouts, keeping persona consistency across languages.

### 2.7 Tech Stack Recommendations
* **Experience layer:** Expo + TypeScript (shares UI primitives with broader ContextCity app).
* **Codex orchestration:** Node.js/TypeScript service backed by Cloud Run or Functions.
* **Intelligence workers:** Python microservices leveraging OpenCV, ffmpeg, GPT-5, and specialized summarization APIs.
* **Video assembly:** Managed services (Creatomate/Shotstack) or Remotion pipelines running on GCP Batch.
* **Storage & delivery:** Cloud Storage, Cloud CDN, signed URLs via Cloud Functions.
* **Observability:** Cloud Logging, OpenTelemetry traces, and metric exports to Grafana/Lighstep.

### 2.8 Trust & Stewardship Controls
* **Safety filters:** Leverage Google Cloud Vision and in-house policies to guard against unsafe or off-brand content before it reaches assembly.
* **Attribution ledger:** Maintain creator handles, licensing constraints, and usage rights alongside each asset.
* **User agency:** Respect opt-outs from Codex personalization, downgrading to neutral highlight reels sourced purely from public signals.
* **Privacy guardrails:** Strip user identifiers from telemetry and enforce data retention windows aligned with platform policy.

## 3. Experience Design

### 3.1 User Interaction
1. User lands on a POI detail page.
2. Codex surfaces a "Social Highlights" card featuring a looping preview clip and Codex tagline, with Dartagnan avatar inviting the user in their preferred language.
3. Tapping "Play Codex Reel" expands to full-screen player with transcript toggle, "Next recommended stop" pill, and a rationale drawer anchored by Dartagnan narration.
4. Video ends with contextual call-to-action (save POI, book an experience, share with a travel party) paired with itinerary and transit CTAs for the concierge flow.

### 3.2 Contextual UI States
* **Pre-fetch shimmer:** Placeholder copy "Codex is gathering whispers" to signal loading.
* **No content fallback:** Present Codex-authored summary and prompt to subscribe for future updates.
* **Network constrained mode:** Offer downloadable transcript and static imagery when streaming is not possible.

### 3.3 UI Mockup (Text-based)
```
+----------------------------------------+
|                POI Header              |
+----------------------------------------+
|  Social Highlights by the Context Codex|
|  "A fresh pulse from the city"         |
|  +-------------------+  +-----------+  |
|  |  Preview Clip     |  | CTA Pills |  |
|  |  [▶ Play Codex]   |  |  Save     |  |
|  +-------------------+  |  Share    |  |
|                         +-----------+  |
+----------------------------------------+
```

### 3.4 Concierge Integration Beats
1. **Welcome whisper:** Dartagnan greets the traveler, auto-selecting language and injecting lore-aligned copy.
2. **Vibe check:** Users scrub highlight beats while seeing live crowd sentiment badges and "Why Codex picked this" insights.
3. **Action pivot:** Booking and navigation CTAs animate in sync with finale frames, bridging the reel into concierge tasks.
4. **Post-play recap:** A digest card captures itinerary slots claimed, upcoming legs, and prompts to explore adjacent POIs.

## 4. Data Flow & Operations

### 4.1 Pipelines
* Scheduled Codex jobs ingest content for trending POIs; long-tail POIs are fetched on-demand with caching.
* Event-day pipeline listens to transit advisories and venue RSVPs, triggering reel refreshes when crowd sentiment spikes.
* Narrative objects and video manifests stored in Firestore with state machine status (draft, localized, published).

### 4.2 Storage & Caching Strategy
* Raw assets stored in transient buckets with lifecycle policies.
* Final reels replicated across regions and cached at the CDN edge with 12-hour TTL; invalidations triggered on significant POI updates.

### 4.3 Observability & Governance
* Emit health metrics (fetch success rate, content rejection rate, localization SLA) to Codex Ops dashboards.
* Route moderation alerts to Trust & Safety queue when Codex flags sensitive content.
* Maintain audit log of content decisions for compliance and creator attribution.
* Power a "Codex whispers back" feedback widget so users can flag misrepresentations or request more context, feeding into weekly content QA.
* Track Dartagnan concierge interactions (greeting plays, itinerary accepts, CTA taps) for persona tuning.

## 5. Success Metrics

### 5.1 Engagement
* Watch-through rate, replays per user, and downstream conversions (save, book, navigate).
* Itinerary step completion rate from highlight reel CTA to booking/navigation.

### 5.2 Codex Impact
* Delta in POI discovery attributed to Codex recommendations post-reel.
* Accuracy of lore references measured via content QA sampling.
* Percentage of users opting into localized narration vs. default English.

### 5.3 Content Quality
* Ratio of positive feedback to moderation escalations.
* Latency from content ingestion to published reel.

### 5.4 Trust & Stewardship
* Percentage of reels with surfaced rationale card taps vs. dismissals.
* Time-to-resolution for user feedback submitted through Codex whisper widget.
* Dartagnan persona satisfaction score gathered via post-demo feedback prompts.

## 6. Open Questions & Next Steps
* Define the minimum viable dataset the Codex needs to bootstrap narration for brand-new POIs.
* Validate licensing constraints per aggregator for derivative video compilations.
* Decide on Remotion vs. managed video assembly before implementation sprint.
* Determine the rubric for when the Codex explicitly explains curation choices vs. implicitly guides the user.
* Confirm reliability windows for real-time transit and RSVP feeds on event day.
* Decide on implementation approach for Dartagnan animation (static overlay vs. lightweight motion).
