import { View, Text, StyleSheet } from 'react-native';
import { CodexiergeDialogue } from '../../types/highlight';

type Props = {
  dialogues: Record<'en' | 'es' | 'fr', CodexiergeDialogue>;
  locale: 'en' | 'es' | 'fr';
};

export function CodexiergeDialogueCard({ dialogues, locale }: Props) {
  const dialogue = dialogues[locale] ?? dialogues.en;
  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.heading}>Dartagnan Concierge</Text>
      <Text style={styles.sectionLabel}>Greeting</Text>
      <Text style={styles.body}>{dialogue.greeting}</Text>
      <Text style={styles.sectionLabel}>Guidance</Text>
      <Text style={styles.body}>{dialogue.guidance}</Text>
      <Text style={styles.sectionLabel}>Celebration</Text>
      <Text style={styles.body}>{dialogue.celebration}</Text>
      <Text style={styles.localeNote}>Locale: {dialogue.locale.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    gap: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  sectionLabel: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5f5',
  },
  body: {
    color: 'white',
    fontSize: 14,
  },
  localeNote: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 12,
  },
});
