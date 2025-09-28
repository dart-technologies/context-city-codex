import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PoiDetailScreen } from '../PoiDetailScreen';
import { felixNarrative, felixSummary, highlightMocks } from '../../mocks/felix';
import { useHighlightSummary } from '../../hooks/useHighlightSummary';
import { recordTelemetry } from '../../services/telemetry';
import { submitFeedback } from '../../services/feedback';

jest.mock('../../features/social/SocialHighlightsCard', () => ({
  SocialHighlightsCard: () => null,
}));

jest.mock('../../features/social/ImmersiveReelPlayer', () => ({
  ImmersiveReelPlayer: () => null,
}));

jest.mock('../../features/concierge/DartagnanOverlay', () => ({
  DartagnanOverlay: () => null,
}));

jest.mock('../../hooks/useHighlightSummary');
jest.mock('../../services/telemetry');
jest.mock('../../services/feedback');

describe('PoiDetailScreen rationale flow', () => {
  const mockUseHighlightSummary = useHighlightSummary as unknown as jest.Mock;
  const mockRecordTelemetry = recordTelemetry as jest.MockedFunction<typeof recordTelemetry>;
  const mockSubmitFeedback = submitFeedback as jest.MockedFunction<typeof submitFeedback>;

  beforeEach(() => {
    mockUseHighlightSummary.mockReset();
    mockRecordTelemetry.mockResolvedValue();
    mockSubmitFeedback.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders rationale card, captures telemetry, and sends feedback', async () => {
    mockUseHighlightSummary.mockReturnValue({
      status: 'ready',
      summary: felixSummary,
      narrative: {
        ...felixNarrative,
        rationale: {
          ...felixNarrative.rationale,
          metadata: {
            ...felixNarrative.rationale.metadata,
            last_updated: new Date().toISOString(),
          },
        },
      },
    });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    const { getByText } = render(<PoiDetailScreen poiId="poi-felix" />);

    expect(getByText('Electric fan vibe')).toBeTruthy();
    expect(getByText('Arrival')).toBeTruthy();
    expect(getByText('Dartagnan here! Ready for your World Cup adventure?')).toBeTruthy();

    await waitFor(() =>
      expect(mockRecordTelemetry).toHaveBeenCalledWith(
        'codex_rationale_viewed',
        expect.objectContaining({ highlightId: 'poi-felix', status: 'approved' })
      )
    );

    fireEvent.press(getByText('Helpful'));

    await waitFor(() => expect(mockSubmitFeedback).toHaveBeenCalledWith({ highlightId: 'poi-felix', wasHelpful: true }));
    await waitFor(() =>
      expect(mockRecordTelemetry).toHaveBeenCalledWith(
        'codex_feedback_submitted',
        expect.objectContaining({ highlightId: 'poi-felix', wasHelpful: true, success: true })
      )
    );

    alertSpy.mockRestore();
  });

  it('shows stale banner but still renders rationale when decision log is aging', async () => {
    mockUseHighlightSummary.mockReturnValue({
      status: 'ready',
      summary: felixSummary,
      narrative: {
        ...felixNarrative,
        rationale: {
          ...felixNarrative.rationale,
          metadata: {
            ...felixNarrative.rationale.metadata,
            last_updated: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
          },
        },
      },
    });

    const { getByText, queryByText } = render(<PoiDetailScreen poiId="poi-felix" />);

    expect(getByText('Electric fan vibe')).toBeTruthy();
    expect(getByText('Codex spotted an older decision log and is revalidating with fresh signals.')).toBeTruthy();
    expect(queryByText('Codex is double-checking this rationale')).toBeNull();

    await waitFor(() =>
      expect(mockRecordTelemetry).toHaveBeenCalledWith(
        'codex_rationale_viewed',
        expect.objectContaining({ highlightId: 'poi-felix', status: 'flagged', warnings: ['stale_decision_log'] })
      )
    );
  });

  it('allows toggling supporter focus and language variants', async () => {
    mockUseHighlightSummary.mockImplementation((poi: string) => {
      if (poi === 'poi-mercado') {
        return {
          status: 'ready',
          summary: highlightMocks['poi-mercado'].summary,
          narrative: highlightMocks['poi-mercado'].narrative,
        };
      }
      return {
        status: 'ready',
        summary: felixSummary,
        narrative: felixNarrative,
      };
    });

    const { getByLabelText, getByText } = render(<PoiDetailScreen poiId="poi-felix" />);

    fireEvent.press(getByLabelText(/Support.*France/));
    fireEvent.press(getByLabelText(/Support option.*Spain/));

    await waitFor(() => expect(getByText('Chants igniting Mercado')).toBeTruthy());

    fireEvent.press(getByLabelText(/Language: English/));
    fireEvent.press(getByLabelText(/Language option.*Español/));

    await waitFor(() =>
      expect(getByText('¡Soy Dartagnan! ¿Listo para vivir la ola roja en Mercado?')).toBeTruthy()
    );
    expect(getByText('Bienvenida')).toBeTruthy();
  });

  it('shows governance notice when decision log is missing required metadata', async () => {
    mockUseHighlightSummary.mockReturnValue({
      status: 'ready',
      summary: felixSummary,
      narrative: {
        ...felixNarrative,
        rationale: {
          ...felixNarrative.rationale,
          metadata: {},
        },
      },
    });

    const { getByText, queryByText } = render(<PoiDetailScreen poiId="poi-felix" />);

    expect(getByText('Codex is double-checking this rationale')).toBeTruthy();
    expect(queryByText('Electric fan vibe')).toBeNull();

    await waitFor(() =>
      expect(mockRecordTelemetry).toHaveBeenCalledWith(
        'codex_rationale_viewed',
        expect.objectContaining({ highlightId: 'poi-felix', status: 'flagged' })
      )
    );
  });
});
