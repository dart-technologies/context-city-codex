import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import NetInfo from '@react-native-community/netinfo';
import { HighlightNarrative } from '../../types/highlight';

const { width, height } = Dimensions.get('window');

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
  const [isLowBandwidth, setLowBandwidth] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<'en' | 'es' | 'fr'>(locale);
  const [isPlaying, setPlaying] = useState(autoPlay);

  const player = useVideoPlayer(narrative.videoUrl, (instance) => {
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

  const toggleTranscript = useCallback(() => setTranscriptVisible((prev) => !prev), []);
  const toggleRationale = useCallback(() => setRationaleVisible((prev) => !prev), []);

  const transcript = useMemo(() => narrative.transcript[selectedLocale] ?? narrative.transcript.en, [narrative.transcript, selectedLocale]);

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

  return (
    <View style={styles.container}>
      {isLowBandwidth ? (
        <View style={styles.lowBandwidthContainer}>
          <Text style={styles.lowBandwidthHeading}>Low bandwidth mode</Text>
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
      <View style={styles.overlay}>
        <Pressable style={styles.button} onPress={handleTogglePlayback} accessibilityRole="button">
          <Text style={styles.buttonLabel}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={toggleTranscript} accessibilityRole="button">
          <Text style={styles.buttonLabel}>{isTranscriptVisible ? 'Hide transcript' : 'Show transcript'}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={toggleRationale} accessibilityRole="button">
          <Text style={styles.buttonLabel}>Why Codex chose this</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onClose} accessibilityRole="button">
          <Text style={styles.buttonLabel}>Close</Text>
        </Pressable>
      </View>
      {isTranscriptVisible && (
        <View style={styles.bottomSheet}>
          <View style={styles.localeRow}>
            {localeOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => handleLocaleChange(option)}
                style={[styles.localePill, option === selectedLocale && styles.localePillActive]}
                accessibilityRole="button"
              >
                <Text style={styles.localePillLabel}>{option.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.sheetHeading}>Transcript</Text>
          <Text style={styles.sheetBody}>{transcript}</Text>
        </View>
      )}
      {isRationaleVisible && (
        <View style={[styles.bottomSheet, styles.rationaleSheet]}>
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
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: 'black',
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
    backgroundColor: '#111',
  },
  lowBandwidthHeading: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  framePlaceholder: {
    width: width * 0.8,
    height: height * 0.2,
    borderRadius: 12,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameText: {
    color: '#d0d0d0',
  },
  overlay: {
    position: 'absolute',
    top: 64,
    right: 24,
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  buttonLabel: {
    color: 'white',
    fontWeight: '700',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 24,
    gap: 12,
  },
  sheetHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  sheetBody: {
    color: '#f0f0f0',
  },
  localeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  localePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  localePillActive: {
    backgroundColor: '#1f60ff',
  },
  localePillLabel: {
    color: 'white',
    fontWeight: '600',
  },
  rationaleSheet: {
    maxHeight: height * 0.35,
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
    color: 'white',
    fontWeight: '600',
  },
  reasonDescription: {
    color: '#cccccc',
  },
});
