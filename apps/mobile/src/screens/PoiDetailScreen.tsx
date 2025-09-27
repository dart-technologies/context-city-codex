import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SocialHighlightsCard } from '../features/social/SocialHighlightsCard';
import { ImmersiveReelPlayer } from '../features/social/ImmersiveReelPlayer';
import { CodexRationaleCard } from '../features/rationale/CodexRationaleCard';
import { DartagnanOverlay } from '../features/concierge/DartagnanOverlay';
import { useHighlightSummary } from '../hooks/useHighlightSummary';
import { submitFeedback } from '../services/feedback';
type Props = {
  poiId: string;
  locale?: 'en' | 'es' | 'fr';
};

export function PoiDetailScreen({ poiId, locale = 'en' }: Props) {
  const { narrative } = useHighlightSummary(poiId);
  const [isPlayerVisible, setPlayerVisible] = useState(false);
  const handleFeedback = useCallback(
    async (wasHelpful: boolean) => {
      if (!narrative) {
        return;
      }

      const success = await submitFeedback({ highlightId: narrative.id, wasHelpful });
      if (success) {
        Alert.alert('Thanks!', 'Dartagnan noted your feedback.');
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
        {narrative && (
          <View style={styles.section}>
            <CodexRationaleCard decisionLog={narrative.rationale} onSubmitFeedback={handleFeedback} />
          </View>
        )}
      </ScrollView>
      {isPlayerVisible && narrative && (
        <View style={styles.modal}>
          <ImmersiveReelPlayer narrative={narrative} onClose={() => setPlayerVisible(false)} locale={locale} />
          <DartagnanOverlay
            cues={narrative.conciergeCues ?? []}
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
  modal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
});
