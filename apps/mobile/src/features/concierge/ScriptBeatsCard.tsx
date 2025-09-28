import { View, Text, StyleSheet } from 'react-native';
import { CodexiergeScript } from '../../types/highlight';
import { COLORS } from '../../theme/colors';

type Props = {
  script: CodexiergeScript;
  locale: 'en' | 'es' | 'fr';
};

export function ScriptBeatsCard({ script, locale }: Props) {
  const beatsForLocale = script.beatsByLocale?.[locale];
  const beats = beatsForLocale ?? script.beatsByLocale?.[script.locale] ?? script.beats;
  const isFallback = !beatsForLocale && locale !== script.locale;

  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.heading}>Codex Script Beats</Text>
      {isFallback && (
        <Text style={styles.fallbackCopy}>
          Showing {script.locale.toUpperCase()} beats while Codex drafts the {locale.toUpperCase()} version.
        </Text>
      )}
      {beats.map((beat) => (
        <View key={beat.id} style={styles.beatRow}>
          <Text style={styles.beatTitle}>{beat.title}</Text>
          <Text style={styles.beatContent}>{beat.content}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  fallbackCopy: {
    color: COLORS.accent,
    fontSize: 12,
  },
  beatRow: {
    gap: 4,
  },
  beatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  beatContent: {
    color: COLORS.textSecondary,
  },
});
