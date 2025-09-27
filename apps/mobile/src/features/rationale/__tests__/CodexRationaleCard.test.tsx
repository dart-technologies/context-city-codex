import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CodexRationaleCard } from '../CodexRationaleCard';
import { felixNarrative } from '../../../mocks/felix';

describe('CodexRationaleCard', () => {
  it('renders reasons and handles feedback', () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <CodexRationaleCard decisionLog={felixNarrative.rationale} onSubmitFeedback={onSubmit} />
    );

    expect(getByText('Electric fan vibe')).toBeTruthy();
    fireEvent.press(getByText('Helpful'));
    expect(onSubmit).toHaveBeenCalledWith(true);
  });
});
