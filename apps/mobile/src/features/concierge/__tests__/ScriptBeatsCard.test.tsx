import React from 'react';
import { render } from '@testing-library/react-native';
import { ScriptBeatsCard } from '../ScriptBeatsCard';

const script = {
  beats: [
    { id: 'beat-1', title: 'Arrival', content: 'Welcome to Mercado.' },
    { id: 'beat-2', title: 'Match', content: 'Head to the stadium.' },
  ],
  locale: 'en' as const,
  provenance: { generator: 'static' },
};

describe('ScriptBeatsCard', () => {
  it('renders beat titles and content', () => {
    const { getByText } = render(<ScriptBeatsCard script={script} />);
    expect(getByText('Arrival')).toBeTruthy();
    expect(getByText('Head to the stadium.')).toBeTruthy();
  });
});
