import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SocialHighlightsCard } from '../features/social/SocialHighlightsCard';
import { ImmersiveReelPlayer } from '../features/social/ImmersiveReelPlayer';
import { CodexRationaleCard } from '../features/rationale/CodexRationaleCard';
import { DartagnanOverlay } from '../features/concierge/DartagnanOverlay';
import { CodexiergeNarrationCue } from '../types/highlight';
import { ScriptBeatsCard } from '../features/concierge/ScriptBeatsCard';
import { CodexiergeDialogueCard } from '../features/concierge/CodexiergeDialogueCard';
import { COLORS } from '../theme/colors';
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

type DropdownOption<Value extends string> = {
  value: Value;
  label: string;
  flag?: string;
};

type ScenarioValue = 'poi-mercado' | 'poi-felix';
type LocaleValue = 'en' | 'es' | 'fr';

const SCENARIO_OPTIONS: DropdownOption<ScenarioValue>[] = [
  { value: 'poi-mercado', label: 'Spain', flag: '🇪🇸' },
  { value: 'poi-felix', label: 'France', flag: '🇫🇷' },
];

const LANGUAGE_OPTIONS: DropdownOption<LocaleValue>[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
];

type DropdownSelectProps<Value extends string> = {
  label: string;
  options: DropdownOption<Value>[];
  selectedValue: Value;
  onSelect: (value: Value) => void;
};

function DropdownSelect<Value extends string>({ label, options, selectedValue, onSelect }: DropdownSelectProps<Value>) {
  const [isOpen, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === selectedValue) ?? options[0];

  return (
    <View style={styles.dropdown}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={styles.dropdownControl}
        accessibilityLabel={`${label}: ${selectedOption?.label ?? 'Select option'}`}
      >
        <Text style={styles.dropdownValue}>
          {selectedOption?.flag ? `${selectedOption.flag} ` : ''}
          {selectedOption?.label ?? 'Select'}
        </Text>
      </Pressable>
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)} />
        <View style={styles.modalContent}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onSelect(option.value);
                setOpen(false);
              }}
              style={styles.optionRow}
              accessibilityRole="button"
              accessibilityLabel={`${label} option ${option.label}`}
            >
              {option.flag && <Text style={styles.optionFlag}>{option.flag}</Text>}
              <Text style={styles.optionLabel}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>
    </View>
  );
}

type Props = {
  poiId: string;
  locale?: 'en' | 'es' | 'fr';
};

export function PoiDetailScreen({ poiId, locale = 'en' }: Props) {
  const [selectedPoiId, setSelectedPoiId] = useState<ScenarioValue>((poiId as ScenarioValue) ?? 'poi-felix');
  const [selectedLocale, setSelectedLocale] = useState<LocaleValue>(locale);
  useEffect(() => {
    setSelectedPoiId((poiId as ScenarioValue) ?? 'poi-felix');
  }, [poiId]);
  useEffect(() => {
    setSelectedLocale(locale);
  }, [locale]);

  const { narrative } = useHighlightSummary(selectedPoiId);
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
      const dialogue = narrative.codexierge[selectedLocale] ?? narrative.codexierge.en;
      if (dialogue) {
        return [
          { step: 'GREETING', locale: dialogue.locale, caption: dialogue.greeting, durationMs: 4000 },
          { step: 'PLAN', locale: dialogue.locale, caption: dialogue.guidance, durationMs: 5000 },
          { step: 'CELEBRATE', locale: dialogue.locale, caption: dialogue.celebration, durationMs: 4000 },
        ];
      }
    }
    return [] as CodexiergeNarrationCue[];
  }, [narrative, selectedLocale]);


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
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.controlRow}>
            <DropdownSelect
              label="Support"
              options={SCENARIO_OPTIONS}
              selectedValue={selectedPoiId}
              onSelect={(next) => {
                setSelectedPoiId(next);
                setPlayerVisible(false);
              }}
            />
            <DropdownSelect
              label="Language"
              options={LANGUAGE_OPTIONS}
              selectedValue={selectedLocale}
              onSelect={(next) => {
                setSelectedLocale(next);
                setPlayerVisible(false);
              }}
            />
          </View>
          <SocialHighlightsCard poiId={selectedPoiId} onPlay={() => setPlayerVisible(true)} userLocale={selectedLocale} />
        </View>
        {narrative && governanceReview && (
          <View style={styles.section}>
            {governanceReview.status === 'flagged' &&
            governanceReview.warnings.some((warning) => warning !== 'stale_decision_log') ? (
              <View style={styles.governanceNotice} accessibilityRole="alert">
                <Text style={styles.noticeHeading}>Codex is double-checking this rationale</Text>
                {governanceReview.warnings.map((warning) => (
                  <Text key={warning} style={styles.noticeCopy}>
                    {WARNING_COPY[warning] ?? 'Codex is refreshing the audit log before sharing this story.'}
                  </Text>
                ))}
              </View>
            ) : (
              <View style={styles.rationaleStack}>
                {governanceReview.warnings.includes('stale_decision_log') && (
                  <View style={styles.noticeBanner} accessibilityRole="status">
                    <Text style={styles.noticeCopy}>{WARNING_COPY.stale_decision_log}</Text>
                  </View>
                )}
                <CodexRationaleCard decisionLog={governanceReview.sanitizedLog} onSubmitFeedback={handleFeedback} />
              </View>
            )}
          </View>
        )}
        {narrative?.script && (
          <View style={styles.section}>
            <ScriptBeatsCard script={narrative.script} locale={selectedLocale} />
          </View>
        )}
        {narrative?.codexierge && (
          <View style={styles.section}>
            <CodexiergeDialogueCard dialogues={narrative.codexierge} locale={selectedLocale} />
          </View>
        )}
      </ScrollView>
      {isPlayerVisible && narrative && (
        <View style={styles.modal}>
          <ImmersiveReelPlayer
            narrative={narrative}
            onClose={() => setPlayerVisible(false)}
            locale={selectedLocale}
          />
          <DartagnanOverlay
            cues={overlayCues}
            itinerary={narrative.itinerary ?? []}
            locale={selectedLocale}
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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  section: {
    gap: 12,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  rationaleStack: {
    gap: 12,
  },
  governanceNotice: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  noticeBanner: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.accentMuted,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  noticeHeading: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  noticeCopy: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  dropdown: {
    flexShrink: 1,
    minWidth: 140,
  },
  dropdownLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dropdownControl: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.surfaceAlt,
  },
  dropdownValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 10, 18, 0.75)',
  },
  modalContent: {
    position: 'absolute',
    top: '30%',
    left: 24,
    right: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
    paddingVertical: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  optionFlag: {
    fontSize: 18,
  },
  optionLabel: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  modal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.sheetBackdrop,
  },
});
