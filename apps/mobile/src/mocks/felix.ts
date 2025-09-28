import { HighlightNarrative, HighlightSummary } from '../types/highlight';

const codexHighlightVideo = require('../../assets/codex/codex-highlight.mp4');
const mercadoHighlightVideo = require('../../assets/codex/mercado-es.mp4');
const felixHighlightVideo = require('../../assets/codex/felix-fr.mp4');

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
  videoUrl: felixHighlightVideo,
  videoByLocale: {
    fr: felixHighlightVideo,
    es: mercadoHighlightVideo,
    en: codexHighlightVideo,
  },
  transcript: {
    en: 'Dartagnan here! Felix in SoHo is pulsing with Les Bleus energy—let me show you the highlights.',
    es: '¡Soy Dartagnan! Felix en SoHo vibra con los fans franceses; mira estos momentos.',
    fr: "C'est Dartagnan ! Felix à SoHo est rempli d'énergie française; découvre ces extraits.",
  },
  accessibility: {
    en: {
      captions: {
        default: 'Codex narration in English for Felix highlights.',
      },
      audioDescriptions: {
        default: {
          text: 'Audio description: Felix rooftop packed with Les Bleus supporters waving flags at sunset.',
          url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
        },
      },
      hapticCues: {
        default: 'Three quick pulses to mimic matchday cheers.',
      },
      altText: {
        hero: 'Fans gathered on Felix rooftop with blue smoke flares and city skyline backdrop.',
      },
    },
    es: {
      captions: {
        default: 'Narración Codex en español para los momentos de Felix.',
      },
      audioDescriptions: {
        default: {
          text: 'Descripción de audio: Terraza de Felix repleta de aficionados con banderas azul y rojo.',
          url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
        },
      },
      hapticCues: {
        default: 'Pulsos suaves en ritmo de cántico para señalar la euforia.',
      },
      altText: {
        hero: 'Aficionados españoles animando con bufandas frente al skyline de Nueva York.',
      },
    },
    fr: {
      captions: {
        default: 'Narration Codex en français pour les temps forts de Felix.',
      },
      audioDescriptions: {
        default: {
          text: 'Description audio : Rooftop de Felix rempli de supporters français agitant des drapeaux bleus.',
          url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
        },
      },
      hapticCues: {
        default: 'Trois impulsions rapides pour imiter les chants des supporters.',
      },
      altText: {
        hero: 'Supporters français applaudissant sur le rooftop avec Manhattan en arrière-plan.',
      },
    },
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
    beatsByLocale: {
      fr: [
        { id: 'beat-1', title: 'Arrivée', content: "Dartagnan t'accueille pour plonger dans la ferveur de Mercado." },
        { id: 'beat-2', title: 'Feu de match', content: 'Cap sur la fan fest avec des transitions Codex maîtrisées.' },
        { id: 'beat-3', title: 'Après-match', content: 'Rendez-vous chez Felix pour célébrer à la française.' },
      ],
      en: [
        { id: 'beat-1', title: 'Arrival', content: 'Dartagnan welcomes you into Felix as Les Bleus chants shake SoHo.' },
        { id: 'beat-2', title: 'Match Heat', content: 'Codex jumps to the fan fest highlights and surfaces trusted cues.' },
        { id: 'beat-3', title: 'After-Party', content: 'Celebrate at Felix with curated French playlists and late-night bites.' },
      ],
      es: [
        { id: 'beat-1', title: 'Llegada', content: 'Dartagnan te recibe en Felix con cánticos franceses por todo SoHo.' },
        { id: 'beat-2', title: 'Ritmo de partido', content: 'Codex enlaza los momentos top de la fan fest y marca los próximos pasos.' },
        { id: 'beat-3', title: 'Celebración', content: 'Brinda en Felix con ritmos franceses y tapas nocturnas guiadas por Codex.' },
      ],
    },
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

export const highlightMocks: Record<string, { summary: HighlightSummary; narrative: HighlightNarrative }> = {
  'poi-felix': {
    summary: felixSummary,
    narrative: felixNarrative,
  },
  'poi-mercado': {
    summary: {
      id: 'poi-mercado',
      title: 'Mercado Little Spain',
      previewUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      locale: 'es',
      tagline: 'Codex captured La Roja fans rehearsing chants at Hudson Yards.',
      ctas: ['plan', 'book', 'guide'],
    },
    narrative: {
      id: 'poi-mercado',
      videoUrl: mercadoHighlightVideo,
      videoByLocale: {
        es: mercadoHighlightVideo,
        en: codexHighlightVideo,
        fr: felixHighlightVideo,
      },
      transcript: {
        es: '¡España está aquí! Mercado vibra con tortilla, vermut y cánticos pre-partido.',
        en: 'Spain is in the house—Mercado hums with vermouth, tapas, and match chants.',
        fr: 'Les supporters espagnols enflamment Mercado avec tapas et chants avant-match.',
      },
      accessibility: {
        es: {
          captions: { default: 'Codex narra la energía de Mercado en español.' },
          audioDescriptions: {
            default: {
              text: 'Descripción de audio: Barras de tapas abarrotadas mientras la peña canta himnos de La Roja.',
              url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
            },
          },
          hapticCues: { default: 'Secuencia de pulsos al ritmo de los bombos y palmas.' },
          altText: { hero: 'Seguidores españoles chocando copas de vermut en Mercado Little Spain.' },
        },
        en: {
          captions: { default: 'Codex narrates Mercado chant rehearsals in English.' },
          audioDescriptions: {
            default: {
              text: 'Audio description: Fans in red scarves drum on tabletops beside jamón displays.',
              url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
            },
          },
          hapticCues: { default: 'Double pulse to mirror the stadium chant beat.' },
          altText: { hero: 'Crowd gathered around a tapas bar with Spanish flags hanging overhead.' },
        },
        fr: {
          captions: { default: 'Codex décrit la ferveur espagnole à Mercado.' },
          audioDescriptions: {
            default: {
              text: 'Description audio : Supporters espagnols frappent des tambours devant un stand de tapas.',
              url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
            },
          },
          hapticCues: { default: 'Impulsions rythmées pour accompagner les percussions.' },
          altText: { hero: 'Supporters espagnols brandissant des drapeaux dans un marché couvert.' },
        },
      },
      keyframes: [
        'https://cdn.contextcity.dev/reels/mercado-frame1.jpg',
        'https://cdn.contextcity.dev/reels/mercado-frame2.jpg',
      ],
      relatedPoiIds: ['poi-felix', 'poi-liberty-fanfest'],
      rationale: {
        highlightId: 'poi-mercado',
        reasons: [
          {
            id: 'chant',
            label: 'Chants igniting Mercado',
            icon: '🎺',
            description: 'Live clips show La Roja chants drawing crowds two hours before kickoff.',
          },
          {
            id: 'cuisine',
            label: 'All-day tapas',
            icon: '🥘',
            description: 'Codex tracked 1,800 mentions of pre-match tapas boards and vermouth pairings.',
          },
        ],
        metadata: {
          distance: 'Steps from 34th St–Hudson Yards',
          last_updated: generatedTimestamp,
        },
      },
      codexiergeCues: [
        { step: 'GREETING', locale: 'es', caption: '¡Vamos España! Te guío entre tapas y cánticos.', durationMs: 3500 },
        { step: 'PLAN', locale: 'es', caption: 'Arrancamos con desayuno castizo y marcha al fan fest.', durationMs: 4000 },
        { step: 'BOOK', locale: 'es', caption: 'Reserva la barra de Jamón & Queso antes de que se llene.', durationMs: 4000 },
        { step: 'GUIDE', locale: 'es', caption: 'Metro 7 hasta Hudson Yards y después PATH directo al estadio.', durationMs: 4500 },
        { step: 'CELEBRATE', locale: 'es', caption: 'Si ganamos, ferry nocturno con fuegos en el Hudson.', durationMs: 4000 },
        { step: 'FAREWELL', locale: 'es', caption: '¡Hasta la final, amigo!', durationMs: 3000 },
      ],
      itinerary: [
        { id: 'plan', label: 'Planificar mi día', description: 'Desayuno, fan fest y transporte con Codex.', action: 'plan' },
        { id: 'book', label: 'Reservar en Mercado', description: 'Asegura una mesa para el banderazo', action: 'book' },
        { id: 'guide', label: 'Guíame al estadio', description: 'Ruta bilingüe por metro y ferry', action: 'guide' },
        { id: 'celebrate', label: 'Celebrar en Hudson River', description: 'Ferry y fuegos con la peña', action: 'celebrate' },
      ],
      script: {
        beats: [
          { id: 'beat-1', title: 'Bienvenida', content: 'Codex abre Mercado con tortilla recién hecha y cánticos de La Roja.' },
          { id: 'beat-2', title: 'Fan fest', content: 'Seguimos a la peña hacia Hudson Yards con coreografías ensayadas.' },
          { id: 'beat-3', title: 'Camino al triunfo', content: 'Codex te cruza al estadio en metro y ferry rojo y amarillo.' },
        ],
        locale: 'es',
        beatsByLocale: {
          es: [
            { id: 'beat-1', title: 'Bienvenida', content: 'Codex abre Mercado con tortilla recién hecha y cánticos de La Roja.' },
            { id: 'beat-2', title: 'Fan fest', content: 'Seguimos a la peña hacia Hudson Yards con coreografías ensayadas.' },
            { id: 'beat-3', title: 'Camino al triunfo', content: 'Codex te cruza al estadio en metro y ferry rojo y amarillo.' },
          ],
          en: [
            { id: 'beat-1', title: 'Kickoff', content: 'Codex opens Mercado with sizzling tortilla and La Roja chants in surround sound.' },
            { id: 'beat-2', title: 'Fan Fest Stream', content: 'We track the march to Hudson Yards and highlight the choreographed chants.' },
            { id: 'beat-3', title: 'Route to Glory', content: 'Codex guides you onto the 7 train and PATH for a red-and-gold arrival.' },
          ],
          fr: [
            { id: 'beat-1', title: 'Accueil', content: 'Codex te sert une tortilla fumante pendant que les chants espagnols montent.' },
            { id: 'beat-2', title: 'Fan fest', content: 'On suit la peña jusqu’à Hudson Yards avec chorés et tambours.' },
            { id: 'beat-3', title: 'Route vers la victoire', content: 'Codex t’ouvre la ligne 7 puis le PATH pour rejoindre le stade en rouge et or.' },
          ],
        },
        provenance: { generator: 'static' },
      },
      codexierge: {
        en: {
          locale: 'en',
          greeting: 'Dartagnan here! Ready to tail La Roja through Mercado?',
          guidance: 'Codex mapped chants, vermouth stops, and PATH transfers—follow my hints.',
          celebration: 'Celebrate on the Hudson ferry if Spain clinches it!',
        },
        es: {
          locale: 'es',
          greeting: '¡Soy Dartagnan! ¿Listo para vivir la ola roja en Mercado?',
          guidance: 'Tengo los cánticos, tapas y rutas al estadio sin perder tiempo.',
          celebration: 'Si ganamos, ferry sobre el Hudson con toda la peña.',
        },
        fr: {
          locale: 'fr',
          greeting: 'C’est Dartagnan ! On suit la Roja à Mercado ?',
          guidance: 'Je traduis chants espagnols et t’ouvre la route vers le PATH.',
          celebration: 'On fête sur le ferry si l’Espagne l’emporte !',
        },
      },
      provenance: {
        script_generator: 'static',
      },
    },
  },
  'poi-liberty-fanfest': {
    summary: {
      id: 'poi-liberty-fanfest',
      title: 'Liberty State Park Fan Festival',
      previewUrl: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&w=1200&q=80',
      locale: 'en',
      tagline: 'Codex tracks ferry arrivals and bilingual chant rehearsals.',
      ctas: ['plan', 'guide', 'celebrate'],
    },
    narrative: {
      id: 'poi-liberty-fanfest',
      videoUrl: codexHighlightVideo,
      videoByLocale: {
        en: codexHighlightVideo,
        es: mercadoHighlightVideo,
        fr: felixHighlightVideo,
      },
      transcript: {
        en: 'Ferry horns cue the festival kickoff—Codex guides you to Liberty State Park for supporter rehearsals.',
        es: 'Los ferris anuncian el festín—Codex te lleva a Liberty State Park para ensayar cánticos.',
        fr: 'Les klaxons des ferries annoncent la fête—Codex te mène au Liberty State Park pour chauffer les chants.',
      },
      keyframes: [
        'https://cdn.contextcity.dev/reels/liberty-frame1.jpg',
        'https://cdn.contextcity.dev/reels/liberty-frame2.jpg',
      ],
      relatedPoiIds: ['poi-mercado', 'poi-metlife'],
      rationale: {
        highlightId: 'poi-liberty-fanfest',
        reasons: [
          {
            id: 'arrival',
            label: 'Ferry arrival cams',
            icon: '🛳️',
            description: 'TikTok streams tagged #LibertyStatePark show ferries dropping supporters every 20 minutes.',
          },
          {
            id: 'bilingual',
            label: 'Bilingual chants',
            icon: '🗣️',
            description: 'Codex spotted alternating Spanish and French chant rehearsals on the main lawn.',
          },
        ],
        metadata: {
          opens: '10:00 AM EDT',
          last_updated: generatedTimestamp,
        },
      },
      itinerary: [
        { id: 'plan', label: 'Plan ferry arrival', description: 'Reserva el ferry de las 11:00 desde Brookfield Place.', action: 'plan' },
        { id: 'guide', label: 'Bilingual guidance', description: 'Codex te ubica en el carril accesible del fan fest.', action: 'guide' },
        { id: 'celebrate', label: 'Fan fest rehearsal', description: 'Únete al ensayo antes de salir rumbo al MetLife.', action: 'celebrate' },
      ],
      script: {
        beats: [
          { id: 'beat-1', title: 'Ferry landing', content: 'Codex te posiciona en la proa para captar la primera ola de cánticos.' },
          { id: 'beat-2', title: 'Chant clinic', content: 'Dartagnan coordina ensayos bilingües con megáfonos y humo azul.' },
          { id: 'beat-3', title: 'Departure pulse', content: 'Codex sincroniza la salida hacia MetLife con alertas de tránsito en tiempo real.' },
        ],
        locale: 'en',
        provenance: { generator: 'static' },
      },
      codexierge: {
        en: {
          locale: 'en',
          greeting: 'Dartagnan here! Ready for your World Cup adventure?',
          guidance: 'Codex tracks ferry arrivals and supporter chants—follow my cues to the front lawn.',
          celebration: 'Meet me back at the docks for a post-victory sail! 🥳',
        },
        es: {
          locale: 'es',
          greeting: '¡Soy Dartagnan! ¿Listo para tu aventura mundialista?',
          guidance: 'Codex sincroniza ferris y cánticos—sígueme al césped central.',
          celebration: 'Nos vemos en el muelle para celebrar tras el partido. 🥳',
        },
        fr: {
          locale: 'fr',
          greeting: "C'est Dartagnan ! Prêt pour ta virée Coupe du Monde ?",
          guidance: 'Codex orchestre ferries et chants—reste dans ma roue pour vibrer sur la pelouse.',
          celebration: 'On se retrouve au quai pour fêter la victoire ! 🥳',
        },
      },
      codexiergeCues: [
        { step: 'GREETING', locale: 'en', caption: 'Welcome aboard—Codex has your ferry slot locked.', durationMs: 3200 },
        { step: 'PLAN', locale: 'en', caption: 'Arrive 30 min early to rehearse chants and pick up merch.', durationMs: 4200 },
        { step: 'GUIDE', locale: 'en', caption: 'Stay in the blue lane for accessible lawn seating.', durationMs: 4200 },
        { step: 'CELEBRATE', locale: 'en', caption: 'Cue the horns—next stop MetLife!', durationMs: 3600 },
      ],
      provenance: {
        script_generator: 'static',
      },
    },
  },
  'poi-metlife': {
    summary: {
      id: 'poi-metlife',
      title: 'MetLife Stadium Final Gate',
      previewUrl: 'https://images.unsplash.com/photo-1530543787849-128d94430c6b?auto=format&fit=crop&w=1200&q=80',
      locale: 'fr',
      tagline: 'Codex suit les cortèges bleus depuis le PATH jusqu’aux tourniquets.',
      ctas: ['plan', 'guide', 'celebrate'],
    },
    narrative: {
      id: 'poi-metlife',
      videoUrl: codexHighlightVideo,
      videoByLocale: {
        fr: codexHighlightVideo,
        en: codexHighlightVideo,
        es: mercadoHighlightVideo,
      },
      transcript: {
        fr: 'Dartagnan te mène dans le corridor bleu – Codex synchronise PATH, NJ Transit et sécurité.',
        en: 'Dartagnan guides you through the blue corridor—Codex syncs PATH, NJ Transit, and security checkpoints.',
        es: 'Dartagnan te guía por el corredor azul, sincronizando PATH, NJ Transit y accesos de seguridad.',
      },
      keyframes: [
        'https://cdn.contextcity.dev/reels/metlife-frame1.jpg',
        'https://cdn.contextcity.dev/reels/metlife-frame2.jpg',
      ],
      relatedPoiIds: ['poi-liberty-fanfest', 'poi-felix'],
      rationale: {
        highlightId: 'poi-metlife',
        reasons: [
          {
            id: 'transit',
            label: 'Transit surge',
            icon: '🚆',
            description: 'Codex detected PATH platform peaks at 16:10 and highlighted backup CoachUSA shuttles.',
          },
          {
            id: 'supporter',
            label: 'Supporter corridor',
            icon: '🟦',
            description: 'Stories tagged #LesBleusNYC show the blue flare tunnel at Gate C ramp.',
          },
        ],
        metadata: {
          gates_open: '17:30 EDT',
          security_advisory: 'Clear bag policy enforced',
          last_updated: generatedTimestamp,
        },
      },
      itinerary: [
        { id: 'plan', label: "Plan d'accès", description: 'PATH 33rd St → Journal Square puis NJ Transit Meadowlands.', action: 'plan' },
        { id: 'guide', label: 'Guidage tourniquets', description: 'Codex te place dans la file bleue pour la section supporters.', action: 'guide' },
        { id: 'celebrate', label: 'Célébrer la victoire', description: 'Coordonne retour ferry ou navette post-match avec alertes live.', action: 'celebrate' },
      ],
      script: {
        beats: [
          { id: 'beat-1', title: 'Tunnel bleu', content: 'Codex synchronise les fumigènes et l’entrée du cortège Les Bleus.' },
          { id: 'beat-2', title: 'Contrôle accès', content: 'Briefing sécurité + accessibilité, badges ADA et files familiales.' },
          { id: 'beat-3', title: 'Montée en tribune', content: 'Guide ta montée vers la section 118 avec chants et tambours live.' },
        ],
        locale: 'fr',
        provenance: { generator: 'static' },
      },
      codexierge: {
        en: {
          locale: 'en',
          greeting: 'Dartagnan here! Ready for your World Cup adventure?',
          guidance: 'Codex tracks PATH congestion and opens the blue corridor when you’re five minutes out.',
          celebration: 'Meet me at the Horizon shuttle stand if extra time runs late.',
        },
        es: {
          locale: 'es',
          greeting: '¡Soy Dartagnan! ¿Listo para tu aventura mundialista?',
          guidance: 'Codex monitorea PATH y NJ Transit para que entres sin filas eternas.',
          celebration: 'Tras el partido te guiaré al ferry del Hudson o al bus rojo.',
        },
        fr: {
          locale: 'fr',
          greeting: 'C’est Dartagnan ! Prêt pour ton aventure Coupe du Monde ?',
          guidance: 'Codex surveille PATH/NJ Transit et t’ouvre le couloir bleu au bon moment.',
          celebration: 'On se retrouve porte C pour rentrer en fanfare !',
        },
      },
      codexiergeCues: [
        { step: 'GREETING', locale: 'fr', caption: 'Bienvenue dans le tunnel bleu, on y est presque !', durationMs: 3200 },
        { step: 'PLAN', locale: 'fr', caption: "Je t'aligne avec le prochain PATH pour éviter la surcharge.", durationMs: 4000 },
        { step: 'GUIDE', locale: 'fr', caption: 'Suis les fumigènes bleus, Codex a sécurisé ton entrée ADA.', durationMs: 4200 },
        { step: 'CELEBRATE', locale: 'fr', caption: 'On se regroupe porte C pour la célébration finale !', durationMs: 3600 },
        { step: 'FAREWELL', locale: 'fr', caption: 'À la prochaine victoire, ami!', durationMs: 3000 },
      ],
      provenance: {
        script_generator: 'static',
      },
    },
  },
};
