import { useEffect, useMemo, useReducer } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ConciergeNarrationCue, ItineraryStep } from '../../types/highlight';

type Phase = 'GREETING' | 'PLAN' | 'BOOK' | 'GUIDE' | 'CELEBRATE' | 'FAREWELL';

type State = {
  phase: Phase;
  currentCue?: ConciergeNarrationCue;
};

type Action =
  | { type: 'ADVANCE'; cue: ConciergeNarrationCue }
  | { type: 'RESET' };

const initialState: State = {
  phase: 'GREETING',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADVANCE':
      return { phase: action.cue.step, currentCue: action.cue };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

type Props = {
  cues: ConciergeNarrationCue[];
  itinerary: ItineraryStep[];
  locale: 'en' | 'es' | 'fr';
  onSelectCTA: (step: ItineraryStep) => void;
};

export function DartagnanOverlay({ cues, itinerary, locale, onSelectCTA }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!cues.length) {
      dispatch({ type: 'RESET' });
      return;
    }

    const timers: NodeJS.Timeout[] = [];
    let elapsed = 0;

    cues.forEach((cue, index) => {
      const delay = index === 0 ? 0 : elapsed;
      if (index > 0) {
        elapsed += cue.durationMs ?? 4000;
      } else {
        elapsed = cue.durationMs ?? 4000;
      }
      const timeout = setTimeout(() => dispatch({ type: 'ADVANCE', cue }), delay);
      timers.push(timeout);
    });

    return () => {
      timers.forEach(clearTimeout);
      dispatch({ type: 'RESET' });
    };
  }, [cues]);

  const journeySteps = useMemo(
    () => (itinerary ?? []).filter((step) => step.action !== 'save' && step.action !== 'share'),
    [itinerary]
  );

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.avatarContainer}>
        <Image
          source={require('../../../assets/codex/dartagnan.png')}
          style={styles.avatar}
          accessibilityIgnoresInvertColors
        />
        <View style={styles.captionBubble}>
          <Text style={styles.captionText}>{state.currentCue?.caption ?? defaultCaption(locale)}</Text>
        </View>
      </View>
      <View style={styles.timeline}>
        {journeySteps.map((step) => (
          <View key={step.id} style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>{step.label}</Text>
            <Text style={styles.timelineDescription}>{step.description}</Text>
            <Text accessibilityRole="button" style={styles.timelineCTA} onPress={() => onSelectCTA(step)}>
              {ctaLabel(step.action)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function defaultCaption(locale: 'en' | 'es' | 'fr') {
  switch (locale) {
    case 'es':
      return '¡Hola! Soy Dartagnan, listo para guiarte.';
    case 'fr':
      return 'Salut! C’est Dartagnan, ton guide pour la finale.';
    default:
      return "Hey there! I'm Dartagnan, ready to guide you.";
  }
}

function ctaLabel(action: ItineraryStep['action']) {
  switch (action) {
    case 'plan':
      return 'Plan itinerary';
    case 'book':
      return 'Book now';
    case 'guide':
      return 'Guide me';
    case 'celebrate':
      return 'Celebrate';
    default:
      return action.toUpperCase();
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    gap: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  captionBubble: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  captionText: {
    color: 'white',
    fontSize: 16,
  },
  timeline: {
    backgroundColor: 'rgba(10,10,10,0.9)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  timelineItem: {
    gap: 4,
  },
  timelineLabel: {
    fontWeight: '700',
    color: 'white',
  },
  timelineDescription: {
    color: '#d0d0d0',
  },
  timelineCTA: {
    color: '#1f60ff',
    fontWeight: '600',
    marginTop: 4,
  },
});
