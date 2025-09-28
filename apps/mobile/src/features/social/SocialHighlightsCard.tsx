import { useMemo } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { HighlightSummary } from '../../types/highlight';
import { useHighlightSummary } from '../../hooks/useHighlightSummary';
import { useLocalization } from '../../hooks/useLocalization';
import { COLORS } from '../../theme/colors';

type Props = {
  poiId: string;
  onPlay: (highlightId: string) => void;
  userLocale?: string;
};

export function SocialHighlightsCard({ poiId, onPlay, userLocale }: Props) {
  const { status, summary } = useHighlightSummary(poiId);
  const { formatMessage } = useLocalization(userLocale);

  const isLoading = status === 'loading' || status === 'idle';
  const isError = status === 'error';

  const ctas = useMemo(() => summary?.ctas ?? [], [summary?.ctas]);

  if (isLoading) {
    return (
      <View style={[styles.card, styles.shimmer]}>
        <ActivityIndicator accessibilityLabel={formatMessage('codex.loading', 'Codex is gathering whispers…')} />
        <Text style={styles.loadingText}>{formatMessage('codex.loading', 'Codex is gathering whispers…')}</Text>
      </View>
    );
  }

  if (isError || !summary) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>Codex is preparing a narrative. Check back soon.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <ImageBackground source={{ uri: summary.previewUrl }} style={styles.preview} imageStyle={styles.previewImage}>
        <Pressable
          style={styles.playButton}
          accessibilityRole="button"
          accessibilityLabel={formatMessage('codex.play', 'Play Codex Reel')}
          onPress={() => onPlay(summary.id)}
        >
          <Text style={styles.playLabel}>▶</Text>
        </Pressable>
      </ImageBackground>
      <View style={styles.content}>
        <Text style={styles.title}>{summary.title}</Text>
        <Text style={styles.tagline}>{summary.tagline}</Text>
        <View style={styles.ctaRow}>
          {ctas.map((cta) => (
            <View key={cta} style={styles.ctaPill} accessible accessibilityRole="button">
              <Text style={styles.ctaText}>{cta.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function stylesFactory() {
  return StyleSheet.create({
    card: {
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.divider,
    },
    shimmer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
    },
    loadingText: {
      marginTop: 12,
      color: COLORS.textSecondary,
    },
    errorText: {
      padding: 24,
      color: COLORS.textSecondary,
    },
    preview: {
      height: 192,
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewImage: {
      resizeMode: 'cover',
    },
    playButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: COLORS.button,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: COLORS.divider,
    },
    playLabel: {
      fontSize: 32,
      color: COLORS.textPrimary,
    },
    content: {
      padding: 16,
      gap: 8,
      backgroundColor: COLORS.surface,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.textPrimary,
    },
    tagline: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    ctaRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    ctaPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: COLORS.accentMuted,
      borderWidth: 1,
      borderColor: COLORS.accentBorder,
    },
    ctaText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.accent,
    },
  });
}

const styles = stylesFactory();
