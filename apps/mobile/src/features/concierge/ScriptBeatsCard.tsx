import { View, Text, StyleSheet } from 'react-native';
import { CodexiergeScript } from '../../types/highlight';

type Props = {
  script: CodexiergeScript;
};

export function ScriptBeatsCard({ script }: Props) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.heading}>Codex Script Beats</Text>
      {script.beats.map((beat) => (
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
    backgroundColor: '#101010',
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  beatRow: {
    gap: 4,
  },
  beatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  beatContent: {
    color: '#d0d0d0',
  },
});
