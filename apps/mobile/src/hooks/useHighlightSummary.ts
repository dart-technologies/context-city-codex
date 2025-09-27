import { useEffect, useState } from 'react';
import { HighlightNarrative, HighlightSummary } from '../types/highlight';
import { highlightMocks } from '../mocks/felix';
import { buildApiUrl } from '../utils/env';

interface HighlightSummaryState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  summary?: HighlightSummary;
  narrative?: HighlightNarrative;
  error?: Error;
}

export function useHighlightSummary(poiId: string) {
  const [state, setState] = useState<HighlightSummaryState>({ status: 'idle' });

  useEffect(() => {
    if (!poiId) {
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    async function fetchHighlight() {
      try {
        let payload: { summary: HighlightSummary; narrative: HighlightNarrative } | undefined;

        try {
          const res = await fetch(buildApiUrl(`/api/highlights/${poiId}`));
          if (res.ok) {
            payload = (await res.json()) as { summary: HighlightSummary; narrative: HighlightNarrative };
          }
        } catch (networkError) {
          console.warn('Falling back to mock highlight data', networkError);
        }

        if (!payload) {
          const mock = highlightMocks[poiId as keyof typeof highlightMocks];
          if (!mock) {
            throw new Error(`No highlight data available for ${poiId}`);
          }
          payload = mock;
        }

        if (!cancelled) {
          setState({ status: 'ready', summary: payload.summary, narrative: payload.narrative });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', error: error as Error });
        }
      }
    }

    void fetchHighlight();

    return () => {
      cancelled = true;
    };
  }, [poiId]);

  return state;
}
