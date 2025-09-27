import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SocialHighlightsCard } from '../features/social/SocialHighlightsCard';
import { ImmersiveReelPlayer } from '../features/social/ImmersiveReelPlayer';
import { CodexRationaleCard } from '../features/rationale/CodexRationaleCard';
import { DartagnanOverlay } from '../features/concierge/DartagnanOverlay';
import { CodexiergeNarrationCue } from '../types/highlight';
import { ScriptBeatsCard } from '../features/concierge/ScriptBeatsCard';
import { CodexiergeDialogueCard } from '../features/concierge/CodexiergeDialogueCard';
import { useHighlightSummary } from '../hooks/useHighlightSummary';
import { submitFeedback } from '../services/feedback';
import { API_BASE_URL } from '../utils/env';
import { auditDecisionLog, GovernanceWarning } from '../services/governance';
import { recordTelemetry } from '../services/telemetry';
const WARNING_COPY: Record<GovernanceWarning, string> = {
  missing_last_updated: 'Codex is refreshing the audit trail before sharing this story.',
  stale_decision_log: 'Codex spotted an older decision log and is revalidating with fresh signals.',
  sensitive_metadata: 'Codex is sanitizing sensitive metadata to protect the traveler before showing more details.',
};

type Props = {
  poiId: string;
  locale?: 'en' | 'es' | 'fr';
};

export function PoiDetailScreen({ poiId, locale = 'en' }: Props) {
  const { narrative } = useHighlightSummary(poiId);
  const governanceReview = useMemo(() => (narrative ? auditDecisionLog(narrative.rationale) : undefined), [narrative]);
  const governanceWarningsKey = governanceReview?.warnings.join('|') ?? '';
  const highlightId = narrative?.id;
  const [isPlayerVisible, setPlayerVisible] = useState(false);
  const overlayCues = useMemo(() => {
    if (!narrative) {
      return [] as CodexiergeNarrationCue[];
    }
    if (narrative.codexiergeCues && narrative.codexiergeCues.length > 0) {
      return narrative.codexiergeCues;
    }
    if (narrative.codexierge) {
      const dialogue = narrative.codexierge[locale] ?? narrative.codexierge.en;
      if (dialogue) {
        return [
          { step: 'GREETING', locale: dialogue.locale, caption: dialogue.greeting, durationMs: 4000 },
          { step: 'PLAN', locale: dialogue.locale, caption: dialogue.guidance, durationMs: 5000 },
          { step: 'CELEBRATE', locale: dialogue.locale, caption: dialogue.celebration, durationMs: 4000 },
        ];
      }
    }
    return [] as CodexiergeNarrationCue[];
  }, [narrative, locale]);


  useEffect(() => {
    if (!highlightId || !governanceReview) {
      return;
    }

    void recordTelemetry('codex_rationale_viewed', {
      highlightId,
      status: governanceReview.status,
      warnings: governanceReview.warnings,
    });
  }, [highlightId, governanceReview?.status, governanceWarningsKey]);

  const handleFeedback = useCallback(
    async (wasHelpful: boolean) => {
      if (!narrative) {
        return;
      }

      const success = await submitFeedback({ highlightId: narrative.id, wasHelpful });
      const telemetryPayload: Record<string, unknown> = {
        highlightId: narrative.id,
        wasHelpful,
        success,
      };
      if (!API_BASE_URL) {
        telemetryPayload.offline = true;
      }
      void recordTelemetry('codex_feedback_submitted', telemetryPayload);

      if (success) {
        Alert.alert('Thanks!', 'Dartagnan noted your feedback.');
      } else if (!API_BASE_URL) {
        Alert.alert('Codex is listening', 'We will sync your feedback once the Codex services reconnect.');
      } else {
        Alert.alert('We hit a snag', 'Please try sharing feedback again later.');
      }
    },
    [narrative]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <SocialHighlightsCard poiId={poiId} onPlay={() => setPlayerVisible(true)} userLocale={locale} />
        </View>
        {narrative && governanceReview && (
          <View style={styles.section}>
            {governanceReview.status === 'approved' ? (
              <CodexRationaleCard decisionLog={governanceReview.sanitizedLog} onSubmitFeedback={handleFeedback} />
            ) : (
              <View style={styles.governanceNotice} accessibilityRole="alert">
                <Text style={styles.noticeHeading}>Codex is double-checking this rationale</Text>
                {governanceReview.warnings.map((warning) => (
                  <Text key={warning} style={styles.noticeCopy}>
                    {WARNING_COPY[warning] ?? 'Codex is refreshing the audit log before sharing this story.'}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
        {narrative?.script && (
          <View style={styles.section}>
            <ScriptBeatsCard script={narrative.script} />
          </View>
        )}
        {narrative?.codexierge && (
          <View style={styles.section}>
            <CodexiergeDialogueCard dialogues={narrative.codexierge} locale={locale} />
          </View>
        )}
      </ScrollView>
      {isPlayerVisible && narrative && (
        <View style={styles.modal}>
          <ImmersiveReelPlayer narrative={narrative} onClose={() => setPlayerVisible(false)} locale={locale} />
          <DartagnanOverlay
            cues={overlayCues}
            itinerary={narrative.itinerary ?? []}
            locale={locale}
            onSelectCTA={(step) => console.log('CTA selected', step)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 12,
  },
  governanceNotice: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    gap: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  noticeHeading: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  noticeCopy: {
    color: '#d0d0d0',
    fontSize: 14,
  },
  modal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
});
