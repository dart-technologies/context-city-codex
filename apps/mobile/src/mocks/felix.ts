import { HighlightNarrative, HighlightSummary } from '../types/highlight';

export const felixSummary: HighlightSummary = {
  id: 'poi-felix',
  title: 'Felix in SoHo',
  previewUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
  locale: 'fr',
  tagline: 'Codex spotted vibrant French celebrations for the final.',
  ctas: ['plan', 'book', 'guide'],
};

const generatedTimestamp = new Date().toISOString();

export const felixNarrative: HighlightNarrative = {
  id: 'poi-felix',
  videoUrl: 'https://cdn.contextcity.dev/reels/felix.mp4',
  transcript: {
    en: 'Dartagnan here! Felix in SoHo is pulsing with Les Bleus energy—let me show you the highlights.',
    es: '¡Soy Dartagnan! Felix en SoHo vibra con los fans franceses; mira estos momentos.',
    fr: "C'est Dartagnan ! Felix à SoHo est rempli d'énergie française; découvre ces extraits.",
  },
  keyframes: [
    'https://cdn.contextcity.dev/reels/felix-frame1.jpg',
    'https://cdn.contextcity.dev/reels/felix-frame2.jpg',
  ],
  relatedPoiIds: ['poi-mercado', 'poi-liberty-fanfest'],
  rationale: {
    highlightId: 'poi-felix',
    reasons: [
      {
        id: 'vibe',
        label: 'Electric fan vibe',
        icon: '⚡',
        description: 'Real-time clips show packed celebrations for Les Bleus supporters.',
      },
      {
        id: 'proximity',
        label: 'Quick hop to PATH',
        icon: '🚇',
        description: 'Easy transfer from SoHo to NJ Transit for the stadium run.',
      },
    ],
    metadata: {
      distance: '0.4 mi from traveler hotel',
      last_updated: generatedTimestamp,
    },
  },
  codexiergeCues: [
    { step: 'GREETING', locale: 'fr', caption: "Salut, ami! Dartagnan t'accompagne aujourd'hui.", durationMs: 3500 },
    { step: 'PLAN', locale: 'fr', caption: 'Planifions ta journée: petit-déjeuner, fan fest, match!', durationMs: 4000 },
    { step: 'BOOK', locale: 'fr', caption: "Je réserve une table chez Felix avant la ruée.", durationMs: 4000 },
    { step: 'GUIDE', locale: 'fr', caption: 'Je t’accompagne vers le ferry puis le stade.', durationMs: 4500 },
    { step: 'CELEBRATE', locale: 'fr', caption: 'La fête continue à Liberty State Park après le match!', durationMs: 4000 },
    { step: 'FAREWELL', locale: 'fr', caption: 'À bientôt, ami!', durationMs: 3000 },
  ],
  itinerary: [
    { id: 'plan', label: 'Plan itinerary', description: 'Review Codex-curated timeline.', action: 'plan' },
    { id: 'book', label: 'Book Felix in SoHo', description: 'Secure brunch table before kickoff.', action: 'book' },
    { id: 'guide', label: 'Guide to MetLife', description: 'Hop PATH + NJ Transit with backup rideshare.', action: 'guide' },
    { id: 'celebrate', label: 'Celebrate at Liberty State Park', description: 'Join fans for ferry fireworks.', action: 'celebrate' },
  ],
  script: {
    beats: [
      { id: 'beat-1', title: 'Arrivee', content: "Dartagnan t'accueille pour plonger dans la ferveur de Mercado." },
      { id: 'beat-2', title: 'Feu de match', content: 'Cap sur la fan fest avec des transitions Codex maitrisees.' },
      { id: 'beat-3', title: 'Apres-match', content: 'Rendez-vous chez Felix pour celebrer a la francaise.' },
    ],
    locale: 'fr',
    provenance: { generator: 'static' },
  },
  codexierge: {
    en: {
      locale: 'en',
      greeting: 'Dartagnan here! Ready for your World Cup adventure?',
      guidance: 'Codex spotted celebration, transit -- follow my cues for smooth hops.',
      celebration: 'Meet me at Liberty State Park for the celebration finale!',
    },
    es: {
      locale: 'es',
      greeting: 'Soy Dartagnan! Listo para tu aventura mundialista?',
      guidance: 'Codex vio celebration, transit -- sigue mis pistas para moverte sin fricciones.',
      celebration: 'Te espero en Liberty State Park para celebrar a lo grande!',
    },
    fr: {
      locale: 'fr',
      greeting: "C'est Dartagnan ! Pret pour ton aventure Coupe du Monde ?",
      guidance: "Codex a repere celebration, transit -- suis mes indications pour avancer sans stress.",
      celebration: 'Rendez-vous a Liberty State Park pour feter la victoire !',
    },
  },
  provenance: {
    script_generator: 'static',
  },
};

export const highlightMocks = {
  'poi-felix': {
    summary: felixSummary,
    narrative: felixNarrative,
  },
} as const;
