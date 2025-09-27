import React from 'react';
import { render } from '@testing-library/react-native';
import { CodexiergeDialogueCard } from '../CodexiergeDialogueCard';

const dialogues = {
  en: {
    locale: 'en' as const,
    greeting: 'Hello',
    guidance: 'Follow the plan',
    celebration: 'Celebrate at Liberty',
  },
  es: {
    locale: 'es' as const,
    greeting: 'Hola',
    guidance: 'Sigue el plan',
    celebration: 'Celebra en Liberty',
  },
  fr: {
    locale: 'fr' as const,
    greeting: 'Salut',
    guidance: 'Suis le plan',
    celebration: 'Fête à Liberty',
  },
};

describe('CodexiergeDialogueCard', () => {
  it('renders localized dialogue', () => {
    const { getByText } = render(<CodexiergeDialogueCard dialogues={dialogues} locale="es" />);
    expect(getByText('Hola')).toBeTruthy();
    expect(getByText('Sigue el plan')).toBeTruthy();
  });
});
