import React from 'react';
import { render, act } from '@testing-library/react-native';
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

    const planButtons = getAllByText('Plan itinerary');
    expect(planButtons.length).toBeGreaterThan(0);
    expect(getByText('À bientôt, ami!')).toBeTruthy();
  });
});
