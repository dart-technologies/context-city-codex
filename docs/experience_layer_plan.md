# Experience Layer Implementation Plan (Expo + TypeScript)

This document outlines how to complete the Experience Layer backlog items in `TODO.md`.

## 1. Social Highlights Entry Point
- **Component:** `SocialHighlightsCard`
- **Location:** `apps/mobile/src/features/social/SocialHighlightsCard.tsx`
- **Layout:**
  - `Animated.View` shimmer placeholder using `react-native-reanimated` while Codex fetches reels.
  - Preview tile uses `ImageBackground` with 16:9 ratio, play button accessible via `accessibilityRole="button"` and `accessibilityLabel` localized.
  - CTA pills (`Save`, `Share`, `Plan`) rendered in `PillBar` component with focus outlines for keyboard/TV.
- **States:**
  1. `loading`: shimmer + "Codex is gathering whispers" copy.
  2. `ready`: preview thumbnail + localized tagline + CTA pills.
  3. `constrained`: static hero image, transcript downloader link.
- **Data:** accepts `HighlightSummary` type with fields `id`, `title`, `previewUrl`, `locale`, `cta`. Fetch via `useHighlightSummary(poiId)` hook.

## 2. Immersive Reel Player
- **Component:** `ImmersiveReelPlayer`
- **Location:** `apps/mobile/src/features/social/ImmersiveReelPlayer.tsx`
- **Features:**
  - Full-screen `Video` element via `expo-video` (SDK 54) with custom controls overlay (play/pause, close).
  - Transcript toggle using bottom sheet; supports locale switching (EN/ES/FR) and analytics hooks.
  - Related POI pill bar horizontally scrollable; selecting updates recommended route but keeps context preserved via Codex store.
  - Rationale drawer accessible by swipe-up gesture, pulling from `HighlightNarrative.rationale`.
- **Bandwidth fallback:** uses `NetInfo` listener; when poor connection, swap video for carousel of key frames + transcript + audio-only play.
- **Testing:** snapshot tests via `@testing-library/react-native`; integration test ensures transcript toggle and rationale drawer fire analytics events.

## 3. Codex Rationale Surfaces
- **Component:** `CodexRationaleCard`
- **Location:** `apps/mobile/src/features/rationale/CodexRationaleCard.tsx`
- **Function:**
  - Displays bullet list of reasons (e.g., proximity, crowd vibe, accessibility) with icons.
  - Pulls localized copy from `decisionLog.rationale` and `decisionLog.metadata`.
  - Includes feedback button hooking into Trust & Stewardship endpoint via `useSubmitFeedback` hook.
- **Accessibility:** ensure card is focusable, supports screen reader summary, includes `why` explanation string.
- **Analytics:** tap events dispatch `codex_rationale_viewed` and `codex_feedback_submitted` to instrumentation context.

## 4. Dartagnan Codexierge Overlay
- **Component:** `DartagnanOverlay`
- **Location:** `apps/mobile/src/features/concierge/DartagnanOverlay.tsx`
- **Features:**
  - Renders Dartagnan avatar (`assets/codex/dartagnan.png`) with Lottie tail-wag animation hook.
  - Localized captions for each narration beat; uses `useConciergeNarration` hook to sync with reel timeline.
  - Sign-off animation triggered at end-of-flow or when user dismisses overlay.
  - Timeline view surfaces Codex itinerary steps with CTA buttons (`Plan`, `Book`, `Guide`, `Celebrate`).
- **State machine:** `xstate` or lightweight reducer to manage `GREETING → PLAN → BOOK → GUIDE → CELEBRATE → FAREWELL`.
- **Testing:** ensure captions update per locale; verify itinerary CTAs supply correct deep links.

## Shared Utilities
- Create `apps/mobile/src/types/highlight.ts` for shared types (`HighlightSummary`, `HighlightNarrative`, `DecisionLog`).
- Provide `useLocalization()` hook to map user locale to translation bundles (English, Spanish, French).
- Centralize analytics in `apps/mobile/src/services/telemetry.ts`.

## Implementation Order
1. Scaffold types + hooks.
2. Build `SocialHighlightsCard` with loading + constrained states.
3. Implement `ImmersiveReelPlayer` controls + fallback.
4. Wire `CodexRationaleCard` with feedback API stub.
5. Add `DartagnanOverlay` and integrate with reel player timeline.

## Next Steps
- Create Expo screen `PoiDetailScreen` to compose card + overlay + rationale surfaces.
- Collaborate with backend team to define `HighlightNarrative` JSON contract.
- Add Jest & React Native Testing Library coverage targets for new components.
