import { useEffect, useMemo, useReducer, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CodexiergeNarrationCue, ItineraryStep } from '../../types/highlight';
import { COLORS } from '../../theme/colors';

type Phase = 'GREETING' | 'PLAN' | 'BOOK' | 'GUIDE' | 'CELEBRATE' | 'FAREWELL';

type State = {
  phase: Phase;
  currentCue?: CodexiergeNarrationCue;
};

type Action =
  | { type: 'ADVANCE'; cue: CodexiergeNarrationCue }
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
  cues: CodexiergeNarrationCue[];
  itinerary: ItineraryStep[];
  locale: 'en' | 'es' | 'fr';
  onSelectCTA: (step: ItineraryStep) => void;
};

export function DartagnanOverlay({ cues, itinerary, locale, onSelectCTA }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isExpanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!cues.length) {
      dispatch({ type: 'RESET' });
      setExpanded(false);
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
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={styles.avatarOverlay} pointerEvents="box-none">
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
        <Pressable
          style={[styles.toggleButton, isExpanded && styles.toggleButtonActive]}
          onPress={() => setExpanded((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? 'Hide itinerary' : 'Plan itinerary'}
        >
          <Text style={[styles.toggleButtonText, isExpanded && styles.toggleButtonTextActive]}>
            {isExpanded ? 'Hide' : 'Plan'}
          </Text>
        </Pressable>
        {isExpanded && (
          <View style={styles.timeline}>
            {journeySteps.map((step) => (
              <View key={step.id} style={styles.timelineItem}>
                <Text style={styles.timelineLabel}>{step.label}</Text>
                <Text style={styles.timelineDescription}>{step.description}</Text>
                <Pressable
                  accessibilityRole="button"
                  style={styles.timelineCTA}
                  onPress={() => onSelectCTA(step)}
                >
                  <Text style={styles.timelineCTAText}>{ctaLabel(step.action)}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
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
  avatarOverlay: {
    position: 'absolute',
    top: 20,
    left: 16,
    width: 260,
    gap: 10,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  captionBubble: {
    flex: 1,
    backgroundColor: COLORS.button,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  captionText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 18,
  },
  toggleButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.button,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.accentMuted,
    borderColor: COLORS.accentBorder,
  },
  toggleButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleButtonTextActive: {
    color: COLORS.accent,
  },
  timeline: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  timelineItem: {
    gap: 6,
  },
  timelineLabel: {
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  timelineDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  timelineCTA: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.accent,
  },
  timelineCTAText: {
    color: '#080a12',
    fontWeight: '700',
    fontSize: 12,
  },
});
