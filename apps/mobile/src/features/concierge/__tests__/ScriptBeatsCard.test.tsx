import React from 'react';
import { render } from '@testing-library/react-native';
import { ScriptBeatsCard } from '../ScriptBeatsCard';

const script = {
  beats: [
    { id: 'beat-1', title: 'Arrival', content: 'Welcome to Mercado.' },
    { id: 'beat-2', title: 'Match', content: 'Head to the stadium.' },
  ],
  locale: 'en' as const,
  beatsByLocale: {
    en: [
      { id: 'beat-1', title: 'Arrival', content: 'Welcome to Mercado.' },
      { id: 'beat-2', title: 'Match', content: 'Head to the stadium.' },
    ],
  },
  provenance: { generator: 'static' },
};

describe('ScriptBeatsCard', () => {
  it('renders beat titles and content', () => {
    const { getByText } = render(<ScriptBeatsCard script={script} locale="en" />);
    expect(getByText('Arrival')).toBeTruthy();
    expect(getByText('Head to the stadium.')).toBeTruthy();
  });

  it('shows fallback notice when locale translation missing', () => {
    const { getByText } = render(<ScriptBeatsCard script={script} locale="es" />);
    expect(getByText(/Showing EN beats/)).toBeTruthy();
  });
});
