import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HighlightNarrative } from '../../types/highlight';
import { COLORS } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

async function loadExpoAudio() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    return require('expo-audio');
  } catch (requireError) {
    return import('expo-audio');
  }
}

type Props = {
  narrative: HighlightNarrative;
  autoPlay?: boolean;
  onClose: () => void;
  locale?: 'en' | 'es' | 'fr';
  onAnalytics?: (event: string, payload?: Record<string, unknown>) => void;
};

export function ImmersiveReelPlayer({ narrative, autoPlay = true, onClose, locale = 'en', onAnalytics }: Props) {
  const [isTranscriptVisible, setTranscriptVisible] = useState(false);
  const [isRationaleVisible, setRationaleVisible] = useState(false);
  const [isAccessibilityVisible, setAccessibilityVisible] = useState(false);
  const [isAccessibilityRendered, setAccessibilityRendered] = useState(false);
  const [isLowBandwidth, setLowBandwidth] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<'en' | 'es' | 'fr'>(locale);
  const [isPlaying, setPlaying] = useState(autoPlay);
  const [isAudioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentAudioDescription, setCurrentAudioDescription] = useState<string | null>(null);
  const [isAudioPlaying, setAudioPlaying] = useState(false);
  const insets = useSafeAreaInsets();
  const transcriptAnim = useRef(new Animated.Value(0)).current;
  const rationaleAnim = useRef(new Animated.Value(0)).current;
  const accessibilityAnim = useRef(new Animated.Value(0)).current;
  const audioRef = useRef<any>(null);

  const videoSource = useMemo(() => {
    const localeVariant = narrative.videoByLocale?.[selectedLocale];
    const fallbackVariant = locale ? narrative.videoByLocale?.[locale] : undefined;
    return localeVariant ?? fallbackVariant ?? narrative.videoUrl;
  }, [locale, narrative.videoByLocale, narrative.videoUrl, selectedLocale]);

  const player = useVideoPlayer(videoSource, (instance) => {
    instance.loop = false;
    instance.muted = false;
    if (autoPlay) {
      instance.play();
    }
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isSlowCell = state.type === 'cellular' && ['2g', '3g'].includes(state.details?.cellularGeneration ?? '');
      setLowBandwidth(Boolean(isSlowCell));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = player.addListener('playingChange', ({ isPlaying }) => {
      setPlaying(isPlaying);
    });
    setPlaying(player.playing);
    return () => subscription.remove();
  }, [player]);

  const toggleTranscript = useCallback(() => {
    setTranscriptVisible((prev) => {
      const next = !prev;
      if (next) {
        setRationaleVisible(false);
        setAccessibilityVisible(false);
      }
      return next;
    });
  }, []);

  const toggleRationale = useCallback(() => {
    setRationaleVisible((prev) => {
      const next = !prev;
      if (next) {
        setTranscriptVisible(false);
        setAccessibilityVisible(false);
      }
      return next;
    });
  }, []);

  const toggleAccessibility = useCallback(() => {
    setAccessibilityVisible((prev) => {
      const next = !prev;
      if (next) {
        setTranscriptVisible(false);
        setRationaleVisible(false);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    Animated.timing(transcriptAnim, {
      toValue: isTranscriptVisible ? 1 : 0,
      duration: 220,
      easing: isTranscriptVisible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isTranscriptVisible, transcriptAnim]);

  useEffect(() => {
    Animated.timing(rationaleAnim, {
      toValue: isRationaleVisible ? 1 : 0,
      duration: 220,
      easing: isRationaleVisible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isRationaleVisible, rationaleAnim]);

  useEffect(() => {
    if (isAccessibilityVisible) {
      setAccessibilityRendered(true);
    }
    Animated.timing(accessibilityAnim, {
      toValue: isAccessibilityVisible ? 1 : 0,
      duration: 220,
      easing: isAccessibilityVisible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!isAccessibilityVisible && finished) {
        setAccessibilityRendered(false);
      }
    });
  }, [accessibilityAnim, isAccessibilityVisible]);

  const transcript = useMemo(() => narrative.transcript[selectedLocale] ?? narrative.transcript.en, [narrative.transcript, selectedLocale]);
  const accessibilityBundle = useMemo(() => {
    const bundles = narrative.accessibility ?? {};
    const bySelected = bundles[selectedLocale];
    const byPropLocale = locale ? bundles[locale] : undefined;
    return bySelected ?? byPropLocale ?? bundles.en ?? bundles.es ?? bundles.fr ?? null;
  }, [locale, narrative.accessibility, selectedLocale]);

  const accessibilityAltText = useMemo(() => {
    if (!accessibilityBundle) return undefined;
    const entries = accessibilityBundle.altText ?? {};
    return entries.hero ?? entries.default ?? Object.values(entries)[0];
  }, [accessibilityBundle]);

  const accessibilityCaption = useMemo(() => {
    if (!accessibilityBundle) return undefined;
    const captions = accessibilityBundle.captions ?? {};
    return captions.default ?? Object.values(captions)[0];
  }, [accessibilityBundle]);

  const audioDescriptions = useMemo(
    () =>
      Object.entries(accessibilityBundle?.audioDescriptions ?? {}).map(([key, entry]) => {
        if (typeof entry === 'string') {
          return { key, text: entry, url: undefined };
        }
        return { key, text: entry.text ?? '', url: entry.url };
      }),
    [accessibilityBundle]
  );
  const hapticCues = useMemo(() => Object.entries(accessibilityBundle?.hapticCues ?? {}), [accessibilityBundle]);

  const handleTogglePlayback = useCallback(async () => {
    try {
      if (player.playing) {
        player.pause();
        onAnalytics?.('player.pause', { highlightId: narrative.id });
      } else {
        player.play();
        onAnalytics?.('player.play', { highlightId: narrative.id });
      }
    } catch (error) {
      console.error('Failed to toggle playback', error);
    }
  }, [player, narrative.id, onAnalytics]);

  const handleLocaleChange = useCallback(
    (nextLocale: 'en' | 'es' | 'fr') => {
      setSelectedLocale(nextLocale);
      onAnalytics?.('transcript.locale_changed', { highlightId: narrative.id, locale: nextLocale });
    },
    [narrative.id, onAnalytics]
  );

  const handleTriggerHaptics = useCallback(
    (cueKey: string, description: string) => {
      if (!description) return;
      Vibration.vibrate(180);
      onAnalytics?.('accessibility.haptic_triggered', {
        highlightId: narrative.id,
        locale: selectedLocale,
        cue: cueKey,
      });
    },
    [narrative.id, onAnalytics, selectedLocale]
  );

  const stopAudioDescription = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.stopAsync?.();
      } catch (error) {
        console.warn('Failed to stop audio description', error);
      }
      try {
        await audioRef.current.unloadAsync?.();
      } catch (error) {
        console.warn('Failed to unload audio description', error);
      }
      audioRef.current = null;
    }
    setAudioPlaying(false);
    setCurrentAudioDescription(null);
  }, []);

  const handlePlayAudioDescription = useCallback(
    async (cueKey: string, url?: string) => {
      if (currentAudioDescription === cueKey && isAudioPlaying) {
        await stopAudioDescription();
        onAnalytics?.('accessibility.audio_description_stopped', {
          highlightId: narrative.id,
          locale: selectedLocale,
          cue: cueKey,
        });
        return;
      }

      await stopAudioDescription();
      setAudioError(null);

      if (!url) {
        setAudioError('Audio description is still rendering.');
        return;
      }

      try {
        setAudioLoading(true);
        const { Audio } = await loadExpoAudio();
        const { sound } = await Audio.Sound.createAsync({ uri: url });
        audioRef.current = sound;
        setCurrentAudioDescription(cueKey);
        setAudioPlaying(true);
        sound.setOnPlaybackStatusUpdate?.((status: any) => {
          if (!status) return;
          if ('isPlaying' in status) {
            setAudioPlaying(Boolean(status.isPlaying));
          }
          if ('didJustFinish' in status && status.didJustFinish) {
            stopAudioDescription().catch(() => undefined);
          }
        });
        await sound.playAsync();
        onAnalytics?.('accessibility.audio_description_played', {
          highlightId: narrative.id,
          locale: selectedLocale,
          cue: cueKey,
        });
      } catch (error) {
        console.error('Unable to play audio description', error);
        setAudioError('Unable to play audio description.');
      } finally {
        setAudioLoading(false);
      }
    },
    [currentAudioDescription, isAudioPlaying, narrative.id, onAnalytics, selectedLocale, stopAudioDescription]
  );

  useEffect(() => {
    setSelectedLocale(locale);
  }, [locale]);

  useEffect(() => {
    onAnalytics?.('player.view', { highlightId: narrative.id });
  }, [narrative.id, onAnalytics]);

  useEffect(() => {
    if (isLowBandwidth) {
      player.pause();
    }
  }, [isLowBandwidth, player]);

  const localeOptions = useMemo(() => Object.keys(narrative.transcript) as Array<'en' | 'es' | 'fr'>, [narrative.transcript]);

  const overlayStyle = useMemo(
    () => [styles.overlay, { top: insets.top + 24 }],
    [insets.top]
  );

  useEffect(() => {
    return () => {
      stopAudioDescription().catch(() => undefined);
    };
  }, [stopAudioDescription]);

  const transcriptSheetStyle = useMemo(
    () => [styles.bottomSheet, { paddingBottom: 24 + insets.bottom }],
    [insets.bottom]
  );

  const rationaleSheetStyle = useMemo(
    () => [styles.bottomSheet, styles.rationaleSheet, { paddingBottom: 24 + insets.bottom }],
    [insets.bottom]
  );

  const accessibilitySheetStyle = useMemo(
    () => [styles.bottomSheet, styles.accessibilitySheet, { paddingBottom: 24 + insets.bottom }],
    [insets.bottom]
  );

  return (
    <View style={styles.container}>
      {isLowBandwidth ? (
        <View style={styles.lowBandwidthContainer}>
          <Text style={styles.lowBandwidthHeading}>Low bandwidth mode</Text>
          {accessibilityCaption ? <Text style={styles.accessibilityBody}>{accessibilityCaption}</Text> : null}
          {accessibilityAltText ? <Text style={styles.accessibilityNote}>Alt text: {accessibilityAltText}</Text> : null}
          {narrative.keyframes.map((frame) => (
            <View key={frame} style={styles.framePlaceholder}>
              <Text style={styles.frameText}>Frame snapshot: {frame}</Text>
            </View>
          ))}
        </View>
      ) : (
        <VideoView
          style={styles.video}
          player={player}
          nativeControls={false}
          contentFit="cover"
          allowsPictureInPicture
        />
      )}
      <View style={overlayStyle}>
        <Pressable
          style={styles.iconButton}
          onPress={handleTogglePlayback}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause reel' : 'Play reel'}
        >
          <Text style={styles.iconLabel}>{isPlaying ? '❚❚' : '▶'}</Text>
        </Pressable>
        <Pressable
          style={styles.iconButton}
          onPress={toggleTranscript}
          accessibilityRole="button"
          accessibilityLabel={isTranscriptVisible ? 'Hide transcript' : 'Show transcript'}
        >
          <Text style={styles.iconLabel}>{flagForLocale(selectedLocale)}</Text>
        </Pressable>
        <Pressable
          style={styles.iconButton}
          onPress={toggleRationale}
          accessibilityRole="button"
          accessibilityLabel="Why Codex chose this"
        >
          <Text style={styles.iconLabel}>ℹ︎</Text>
        </Pressable>
        <Pressable
          style={styles.iconButton}
          onPress={toggleAccessibility}
          accessibilityRole="button"
          accessibilityLabel={isAccessibilityVisible ? 'Hide accessibility options' : 'Show accessibility options'}
        >
          <Text style={styles.iconLabel}>♿</Text>
        </Pressable>
        <Pressable
          style={styles.iconButton}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close player"
        >
          <Text style={styles.iconLabel}>✕</Text>
        </Pressable>
      </View>
      <Animated.View
        style={[
          transcriptSheetStyle,
          {
            opacity: transcriptAnim,
            transform: [
              {
                translateY: transcriptAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [200, 0],
                }),
              },
            ],
            pointerEvents: isTranscriptVisible ? 'auto' : 'none',
          },
        ]}
      >
        {isTranscriptVisible && (
          <>
            <View style={styles.localeRow}>
            {localeOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => handleLocaleChange(option)}
                style={[styles.localePill, option === selectedLocale && styles.localePillActive]}
                accessibilityRole="button"
              >
                <Text style={styles.localePillLabel}>{flagForLocale(option)} </Text>
              </Pressable>
            ))}
            </View>
            <Text style={styles.sheetHeading}>Transcript</Text>
            <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetScrollContent}>
              <Text style={styles.sheetBody}>{transcript}</Text>
            </ScrollView>
          </>
        )}
      </Animated.View>
      <Animated.View
        style={[
          rationaleSheetStyle,
          {
            opacity: rationaleAnim,
            transform: [
              {
                translateY: rationaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [200, 0],
                }),
              },
            ],
            pointerEvents: isRationaleVisible ? 'auto' : 'none',
          },
        ]}
      >
        {isRationaleVisible && (
          <>
            <Text style={styles.sheetHeading}>Why Codex chose this</Text>
            {narrative.rationale.reasons.map((reason) => (
              <View key={reason.id} style={styles.reasonRow}>
                <Text style={styles.reasonIcon}>{reason.icon}</Text>
                <View style={styles.reasonContent}>
                  <Text style={styles.reasonLabel}>{reason.label}</Text>
                  <Text style={styles.reasonDescription}>{reason.description}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </Animated.View>
      <Animated.View
        style={[
          accessibilitySheetStyle,
          {
            opacity: accessibilityAnim,
            transform: [
              {
                translateY: accessibilityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [200, 0],
                }),
              },
            ],
            pointerEvents: isAccessibilityVisible ? 'auto' : 'none',
          },
        ]}
      >
        {isAccessibilityRendered && (
          <>
            <Text style={styles.sheetHeading}>Accessibility</Text>
            <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetScrollContent}>
              {accessibilityBundle ? (
                <>
                  {accessibilityCaption ? (
                    <View style={styles.accessibilitySection}>
                      <Text style={styles.accessibilitySectionHeading}>Narrated caption</Text>
                      <Text style={styles.accessibilityBody}>{accessibilityCaption}</Text>
                    </View>
                  ) : null}
                  {audioDescriptions.length ? (
                    <View style={styles.accessibilitySection}>
                      <Text style={styles.accessibilitySectionHeading}>Audio descriptions</Text>
                      {audioDescriptions.map(({ key, text, url }) => {
                        const isActive = currentAudioDescription === key && isAudioPlaying;
                        const isLoading = isAudioLoading && currentAudioDescription === key;
                        const disabled = !url || isAudioLoading;
                        return (
                          <View key={key} style={styles.accessibilityCard}>
                            <View style={styles.accessibilityCueHeader}>
                              <Text style={styles.accessibilityCueLabel}>{key}</Text>
                              <Pressable
                                style={[styles.accessibilityAction, disabled && styles.accessibilityActionDisabled]}
                                onPress={() => handlePlayAudioDescription(key, url)}
                                accessibilityRole="button"
                                accessibilityLabel={isActive ? `Stop audio description ${key}` : `Play audio description ${key}`}
                                disabled={disabled}
                              >
                                <Text style={styles.accessibilityActionLabel}>
                                  {isLoading ? 'Loading…' : isActive ? 'Stop' : 'Play'}
                                </Text>
                              </Pressable>
                            </View>
                            <Text style={styles.sheetBody}>{text}</Text>
                            {!url ? <Text style={styles.accessibilityNote}>Codex is still rendering audio for this moment.</Text> : null}
                          </View>
                        );
                      })}
                      {audioError ? <Text style={styles.accessibilityNote}>{audioError}</Text> : null}
                    </View>
                  ) : null}
                  {hapticCues.length ? (
                    <View style={styles.accessibilitySection}>
                      <Text style={styles.accessibilitySectionHeading}>Haptic cues</Text>
                      {hapticCues.map(([key, description]) => (
                        <View key={key} style={styles.accessibilityCard}>
                          <View style={styles.accessibilityCueHeader}>
                            <Text style={styles.accessibilityCueLabel}>{key}</Text>
                            <Pressable
                              style={styles.accessibilityAction}
                              onPress={() => handleTriggerHaptics(key, description)}
                              accessibilityRole="button"
                              accessibilityLabel={`Play haptic cue ${key}`}
                            >
                              <Text style={styles.accessibilityActionLabel}>Feel cue</Text>
                            </Pressable>
                          </View>
                          <Text style={styles.sheetBody}>{description}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {accessibilityAltText ? (
                    <View style={styles.accessibilitySection}>
                      <Text style={styles.accessibilitySectionHeading}>Alt text</Text>
                      <Text style={styles.accessibilityBody}>{accessibilityAltText}</Text>
                    </View>
                  ) : null}
                </>
              ) : (
                <Text style={styles.sheetBody}>Codex is preparing accessibility assets for this highlight.</Text>
              )}
            </ScrollView>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: COLORS.background,
  },
  video: {
    width,
    height,
  },
  lowBandwidthContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
  },
  lowBandwidthHeading: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 18,
  },
  framePlaceholder: {
    width: width * 0.8,
    height: height * 0.2,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameText: {
    color: COLORS.textSecondary,
  },
  overlay: {
    position: 'absolute',
    right: 8,
    gap: 12,
    backgroundColor: 'rgba(8, 10, 18, 0.35)',
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.button,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  iconLabel: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.sheetBackdrop,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  sheetScroll: {
    maxHeight: height * 0.55,
  },
  sheetScrollContent: {
    paddingBottom: 16,
  },
  sheetHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sheetBody: {
    color: COLORS.textSecondary,
  },
  localeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  localePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceAlt,
  },
  localePillActive: {
    backgroundColor: COLORS.buttonActive,
  },
  localePillLabel: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  rationaleSheet: {
    maxHeight: height * 0.35,
  },
  accessibilitySheet: {
    maxHeight: height * 0.5,
  },
  reasonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  reasonIcon: {
    fontSize: 24,
  },
  reasonContent: {
    flex: 1,
  },
  reasonLabel: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  reasonDescription: {
    color: COLORS.textSecondary,
  },
  accessibilitySection: {
    gap: 6,
    marginBottom: 16,
  },
  accessibilitySectionHeading: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  accessibilityBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  accessibilityNote: {
    color: 'rgba(199, 204, 224, 0.7)',
    fontSize: 13,
  },
  accessibilityCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  accessibilityCueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accessibilityCueLabel: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  accessibilityAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.buttonActive,
  },
  accessibilityActionDisabled: {
    backgroundColor: 'rgba(31, 96, 255, 0.3)',
  },
  accessibilityActionLabel: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
});
function flagForLocale(locale: 'en' | 'es' | 'fr'): string {
  switch (locale) {
    case 'es':
      return '🇪🇸';
    case 'fr':
      return '🇫🇷';
    default:
      return '🇺🇸';
  }
}
