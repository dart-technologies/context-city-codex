import React from 'react';
import { render } from '@testing-library/react-native';
import { SocialHighlightsCard } from '../SocialHighlightsCard';
jest.mock('../../../hooks/useHighlightSummary', () => ({
  useHighlightSummary: () => ({
    status: 'ready',
    summary: {
      id: 'poi-felix',
      title: 'Felix in SoHo',
      previewUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1',
      locale: 'fr',
      tagline: 'Codex spotted vibrant French celebrations for the final.',
      ctas: ['plan', 'book', 'guide'],
    },
  }),
}));

jest.mock('../../../hooks/useLocalization', () => ({
  useLocalization: () => ({
    formatMessage: (_: string, defaultMessage: string) => defaultMessage,
  }),
}));

describe('SocialHighlightsCard', () => {
  it('renders summary title and CTA pills', () => {
    const { getByText } = render(<SocialHighlightsCard poiId="poi-felix" onPlay={jest.fn()} />);
    expect(getByText('Felix in SoHo')).toBeTruthy();
    expect(getByText('PLAN')).toBeTruthy();
    expect(getByText('BOOK')).toBeTruthy();
    expect(getByText('GUIDE')).toBeTruthy();
  });
});
