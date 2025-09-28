export type HighlightCTA = 'save' | 'share' | 'plan' | 'book' | 'guide' | 'celebrate';

export interface HighlightSummary {
  id: string;
  title: string;
  previewUrl: string;
  locale: 'en' | 'es' | 'fr';
  tagline: string;
  ctas: HighlightCTA[];
}

export interface DecisionReason {
  id: string;
  label: string;
  icon: string;
  description: string;
}


export interface ScriptBeat {
  id: string;
  title: string;
  content: string;
}

export interface CodexiergeScript {
  beats: ScriptBeat[];
  locale: 'en' | 'es' | 'fr';
  beatsByLocale?: Partial<Record<'en' | 'es' | 'fr', ScriptBeat[]>>;
  provenance?: Record<string, unknown>;
}

export interface CodexiergeDialogue {
  locale: 'en' | 'es' | 'fr';
  greeting: string;
  guidance: string;
  celebration: string;
}

export interface DecisionLog {
  highlightId: string;
  reasons: DecisionReason[];
  metadata: Record<string, unknown>;
}

type AccessibilityAudioEntry =
  | string
  | {
      text: string;
      url?: string;
    };

export interface HighlightNarrative {
  id: string;
  videoUrl: string;
  videoByLocale?: Partial<Record<'en' | 'es' | 'fr', string>>;
  transcript: Record<'en' | 'es' | 'fr', string>;
  accessibility?: Partial<
    Record<
      'en' | 'es' | 'fr',
      {
        captions: Record<string, string>;
        audioDescriptions: Record<string, AccessibilityAudioEntry>;
        hapticCues: Record<string, string>;
        altText: Record<string, string>;
      }
    >
  >;
  keyframes: string[];
  relatedPoiIds: string[];
  rationale: DecisionLog;
  codexiergeCues?: CodexiergeNarrationCue[];
  itinerary?: ItineraryStep[];
  script?: CodexiergeScript;
  codexierge?: Record<'en' | 'es' | 'fr', CodexiergeDialogue>;
  provenance?: Record<string, unknown>;
}

export interface ItineraryStep {
  id: string;
  label: string;
  description: string;
  action: HighlightCTA;
  deepLink?: string;
}

export interface CodexiergeNarrationCue {
  step: 'GREETING' | 'PLAN' | 'BOOK' | 'GUIDE' | 'CELEBRATE' | 'FAREWELL';
  locale: 'en' | 'es' | 'fr';
  caption: string;
  audioUrl?: string;
  durationMs?: number;
}
