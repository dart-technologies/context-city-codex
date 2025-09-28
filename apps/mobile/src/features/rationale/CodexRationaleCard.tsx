import { StyleSheet, Text, View } from 'react-native';
import { DecisionLog } from '../../types/highlight';

type Props = {
  decisionLog: DecisionLog;
  onSubmitFeedback: (wasHelpful: boolean) => void;
};

export function CodexRationaleCard({ decisionLog, onSubmitFeedback }: Props) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.heading}>Why the Codexierge chose this</Text>
      {decisionLog.reasons.map((reason) => (
        <View key={reason.id} style={styles.reasonRow}>
          <Text style={styles.reasonIcon}>{reason.icon}</Text>
          <View style={styles.reasonCopy}>
            <Text style={styles.reasonLabel}>{reason.label}</Text>
            <Text style={styles.reasonDescription}>{reason.description}</Text>
          </View>
        </View>
      ))}
      <View style={styles.feedbackRow}>
        <Text
          accessibilityRole="button"
          style={[styles.feedbackButton, styles.positive]}
          onPress={() => onSubmitFeedback(true)}
        >
          Helpful
        </Text>
        <Text
          accessibilityRole="button"
          style={[styles.feedbackButton, styles.negative]}
          onPress={() => onSubmitFeedback(false)}
        >
          Needs work
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#111',
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  reasonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  reasonIcon: {
    fontSize: 24,
  },
  reasonCopy: {
    flex: 1,
    gap: 4,
  },
  reasonLabel: {
    fontWeight: '600',
    color: 'white',
  },
  reasonDescription: {
    color: '#d0d0d0',
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-start',
  },
  feedbackButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    fontWeight: '600',
    color: 'white',
  },
  positive: {
    backgroundColor: '#0f9d58',
  },
  negative: {
    backgroundColor: '#db4437',
  },
});
