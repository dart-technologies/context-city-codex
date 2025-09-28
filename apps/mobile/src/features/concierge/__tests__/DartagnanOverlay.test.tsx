import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { DartagnanOverlay } from '../DartagnanOverlay';
import { felixNarrative } from '../../../mocks/felix';

jest.useFakeTimers();

describe('DartagnanOverlay', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('displays cues and itinerary CTAs', () => {
    const { getByText, getAllByText } = render(
      <DartagnanOverlay
        cues={felixNarrative.codexiergeCues ?? []}
        itinerary={felixNarrative.itinerary ?? []}
        locale="fr"
        onSelectCTA={jest.fn()}
      />
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });

    const planToggle = getByText('Plan');
    act(() => {
      fireEvent.press(planToggle);
    });

    expect(getByText(/À bientôt, ami!/i)).toBeTruthy();

    const planButtons = getAllByText('Plan itinerary');
    expect(planButtons.length).toBeGreaterThan(0);
  });
});
