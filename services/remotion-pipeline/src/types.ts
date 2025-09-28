export type HighlightSegment = {
  assetId: string;
  mediaUrl: string;
  caption: string;
  title?: string;
  rationale?: string;
  subtitles?: Record<string, string>;
};

export type CodexHighlightProps = {
  poi: {
    id: string;
    name: string;
    locale: string;
    distance?: string | null;
    hours?: string | null;
    tags?: string[];
  };
  summary: string;
  codexiergeLocales: string[];
  segments: HighlightSegment[];
  brandColor?: string;
  accentColor?: string;
  soundtrackUrl?: string;
  clipDurationSeconds?: number;
  transitionMs?: number;
  narrations?: Record<string, LocaleNarrationProps>;
};

export type LocaleNarrationProps = {
  locale: string;
  audioUrl?: string | null;
  voice?: string | null;
  subtitles: Record<string, string>;
};
