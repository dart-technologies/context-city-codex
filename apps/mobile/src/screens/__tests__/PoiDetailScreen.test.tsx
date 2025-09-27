import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PoiDetailScreen } from '../PoiDetailScreen';
import { felixNarrative, felixSummary } from '../../mocks/felix';
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
    expect(getByText('Arrivee')).toBeTruthy();
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
