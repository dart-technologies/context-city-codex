# Real-Time Highlight Renderer Proposal

## Context

The current Social Feed Highlight experience ships as pre-rendered MP4s produced by the Content Intelligence pipeline (Remotion/Creatomate). This keeps the Expo client lightweight, but limits per-user personalization and live remixing. With modern iPhone GPUs (A18+), we can explore streaming highlights directly inside the React Native experience while still honoring localization, accessibility, and concierge cues.

## Goals

1. Evaluate a React Native/Expo rendering path that composites GPT-5-authored highlight manifests in real time.
2. Maintain feature parity with the MP4 flow: multi-language captions, audio descriptions, rationale overlays, and concierge CTAs.
3. Preserve a graceful fallback to MP4 for unsupported hardware or thermal constraints.

## Proposed Architecture

```
GPT-5 Content Workers
   ↓ (Highlight Manifest JSON)
Codex Orchestrator API  ── SSE/WebSocket ──┐
                                          │
                               Expo Client Store (zustand/redux)
                                          │
                         ┌────────────────┴────────────────┐
                         │ HighlightRenderer React component│
                         └────────────────┬────────────────┘
                                          │
             ┌──────────┬───────────┬───────────┬──────────┐
             │ Video    │ Imagery   │ Text/Rationale │ CTA  │
             │ (expo-video)        │ (Skia/Reanimated)      │
             └──────────┴───────────┴───────────┴──────────┘
                                          │
                                   Accessibility Layer
                               (captions, audio descriptions,
                                haptic cues via expo-audio/haptics)
```

### Manifest Contract

The Content Intelligence workers publish a `HighlightManifest` structure containing:

- `segments`: ordered clips with asset URLs, start/end timestamps, captions, locales.
- `overlays`: timed text/rationale blocks with styling hints.
- `audio`: narration + audio-description URLs per locale.
- `accessibility`: captions, audio-description metadata, haptic cues.
- `cta`: concierge steps with actions (plan, book, guide, celebrate).
- `fallback`: pre-rendered MP4 URL for low-power mode.

### Rendering Pipeline

1. **Manifest ingestion**: Expo app fetches the manifest via REST and subscribes to live updates (SSE/WebSocket).
2. **Asset preloading**: Use `expo-asset`/`Image.prefetch` to stage imagery, `expo-audio` for audio staging.
3. **Timeline clock**: Shared `useTimeline` hook drives animations; relies on `requestAnimationFrame` or Reanimated shared values.
4. **Layer compositing**:
   - Video: `expo-video` (hardware decoded) with custom overlays.
   - Text/graphics: `@shopify/react-native-skia` for GPU-accelerated typography and transitions.
   - CTA overlays: positioned views synchronized with timeline.
5. **Accessibility**: `expo-audio` for GPT narration/audio-descriptions, `expo-haptics` for timed feedback, voiceover labels sourced from manifest.
6. **Telemetry**: Emit `highlight.frame_drop`, `cta.triggered`, `accessibility.audio_play` metrics for GPU viability tracking.
7. **Fallback**: On frame drops/thermal warnings, swap to `fallback.mp4` via the existing MP4 player.

## Evaluation Plan

1. **Prototype Scene**
   - Implement a sample renderer with 3 clips, GPU overlays, and real-time CTA animations.
   - Run on iPhone 16 and 17 hardware with Xcode Instruments (Core Animation, GPU Driver).

2. **Performance Benchmarks**
   - Target 30 FPS @ 1080×1920 with 3–4 overlay layers.
   - Keep GPU utilization < 60% and frame drops < 2% during 30-second playback.
   - Monitor energy/battery impact and thermal state.

3. **Accessibility Validation**
   - Confirm captions/audio-description toggles respond instantly.
   - VoiceOver and Dynamic Type behavior with custom Skia overlays.

4. **Comparative Metrics**
   - Compare startup latency, bandwidth, and energy usage against MP4 playback.
   - Document personalization wins (locale switching mid-playback, CTA personalization) impossible with static video.

5. **Operational Considerations**
   - Define manifest versioning and diffing strategy for streaming updates.
   - Security review: ensure asset URLs respect auth policies.
   - Fallback criteria: define thresholds for switching back to MP4.

## Risks & Mitigations

- **GPU/thermal limits on older devices**: restrict real-time renderer to iPhone 16/17, keep MP4 fallback for others.
- **Bundle size**: ensure new rendering libs (Skia, reanimated) stay within OTA update limits; lazy load assets.
- **Complexity vs. value**: pilot on a single marquee POI before committing to full migration.

## Next Steps

1. Align on manifest schema updates with Content Intelligence team.
2. Build Expo prototype branch (`feature/real-time-renderer`) with sample manifest.
3. Capture performance traces on physical devices.
4. Present findings and decide whether to invest in a hybrid (MP4 + live) rollout post-hackathon.

