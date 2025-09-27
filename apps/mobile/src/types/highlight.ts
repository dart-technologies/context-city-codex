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

export interface DecisionLog {
  highlightId: string;
  reasons: DecisionReason[];
  metadata: Record<string, unknown>;
}

export interface HighlightNarrative {
  id: string;
  videoUrl: string;
  transcript: Record<'en' | 'es' | 'fr', string>;
  keyframes: string[];
  relatedPoiIds: string[];
  rationale: DecisionLog;
  conciergeCues?: ConciergeNarrationCue[];
  itinerary?: ItineraryStep[];
}

export interface ItineraryStep {
  id: string;
  label: string;
  description: string;
  action: HighlightCTA;
  deepLink?: string;
}

export interface ConciergeNarrationCue {
  step: 'GREETING' | 'PLAN' | 'BOOK' | 'GUIDE' | 'CELEBRATE' | 'FAREWELL';
  locale: 'en' | 'es' | 'fr';
  caption: string;
  audioUrl?: string;
  durationMs?: number;
}
