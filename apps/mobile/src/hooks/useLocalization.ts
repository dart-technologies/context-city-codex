import { useMemo } from 'react';

const SUPPORTED_LOCALES = ['en', 'es', 'fr'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

interface LocalizationBundle {
  locale: SupportedLocale;
  formatMessage: (id: string, defaultMessage: string) => string;
}

export function useLocalization(userLocale?: string): LocalizationBundle {
  return useMemo(() => {
    const locale = (SUPPORTED_LOCALES.includes((userLocale ?? 'en') as SupportedLocale)
      ? (userLocale as SupportedLocale)
      : 'en');

    const translations: Record<string, Record<string, string>> = {
      en: {
        'codex.loading': 'Codex is gathering whispers…',
        'codex.play': 'Play Codex Reel',
      },
      es: {
        'codex.loading': 'El Codex está reuniendo susurros…',
        'codex.play': 'Reproducir reel del Codex',
      },
      fr: {
        'codex.loading': 'Le Codex collecte des murmures…',
        'codex.play': 'Lire le récit du Codex',
      },
    };

    return {
      locale,
      formatMessage: (id: string, defaultMessage: string) => translations[locale][id] ?? defaultMessage,
    };
  }, [userLocale]);
}
