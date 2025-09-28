import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ItineraryStep } from '../../types/highlight';
import { COLORS } from '../../theme/colors';

type Locale = 'en' | 'es' | 'fr';

type Props = {
  poiName: string;
  steps: ItineraryStep[];
  locale: Locale;
};

const COPY: Record<Locale, { title: string; subtitle: string; footer: (count: number) => string }> = {
  en: {
    title: 'Route to {poi}',
    subtitle: 'Codex keeps these moves on tempo.',
    footer: (count) => `+${count} more stage${count === 1 ? '' : 's'} planned in Codexierge`,
  },
  es: {
    title: 'Ruta hacia {poi}',
    subtitle: 'Codex sincroniza cada paso.',
    footer: (count) => `+${count} movimiento${count === 1 ? '' : 's'} extra planificado por Codexierge`,
  },
  fr: {
    title: 'Itinéraire vers {poi}',
    subtitle: 'Codex cadence chaque étape.',
    footer: (count) => `+${count} étape${count === 1 ? '' : 's'} supplémentaires dans Codexierge`,
  },
};

const ACTION_ICONS: Partial<Record<ItineraryStep['action'], string>> = {
  plan: '🗺️',
  book: '📆',
  guide: '🧭',
  celebrate: '🎉',
  share: '📣',
  save: '⭐',
};

const STEP_COPY: Record<Locale, Partial<Record<ItineraryStep['action'], { label: string; description: string }>>> = {
  en: {},
  es: {
    plan: { label: 'Planificar itinerario', description: 'Revisa la agenda que prepara Codex.' },
    book: { label: 'Reservar', description: 'Confirma tu mesa o entrada antes de la avalancha.' },
    guide: { label: 'Guíame', description: 'Codex marca la ruta óptima paso a paso.' },
    celebrate: { label: 'Celebrar', description: 'Únete al festejo final sin perderte en el camino.' },
    save: { label: 'Guardar', description: 'Añade este momento a tu viaje Codex.' },
    share: { label: 'Compartir', description: 'Comparte la hoja de ruta con tu equipo.' },
  },
  fr: {
    plan: { label: 'Planifier', description: 'Passe en revue le programme préparé par Codex.' },
    book: { label: 'Réserver', description: 'Sécurise ta table ou ton billet avant la foule.' },
    guide: { label: 'Guidage', description: 'Codex t’accompagne à chaque étape du trajet.' },
    celebrate: { label: 'Célébrer', description: 'Rejoins la fête finale sans perdre le fil.' },
    save: { label: 'Enregistrer', description: 'Ajoute cette étape à ton voyage Codex.' },
    share: { label: 'Partager', description: 'Partage l’itinéraire avec ta troupe.' },
  },
};

export function ItineraryMapCard({ poiName, steps, locale }: Props) {
  const copy = COPY[locale] ?? COPY.en;
  const heading = useMemo(() => copy.title.replace('{poi}', poiName), [copy.title, poiName]);
  const visibleSteps = steps;
  const remainingCount = Math.max(0, steps.length - visibleSteps.length);

  if (!steps.length) {
    return null;
  }

  return (
    <View style={styles.card} accessibilityRole="summary">
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.subtitle}>{copy.subtitle}</Text>
      <View style={styles.list}>
        {visibleSteps.map((step) => {
          const localized = STEP_COPY[locale]?.[step.action];
          return (
            <View key={step.id} style={styles.listRow}>
              <Text style={styles.listIcon}>{ACTION_ICONS[step.action] ?? '•'}</Text>
              <View style={styles.listCopy}>
              <Text style={styles.stepLabel}>{localized?.label ?? step.label}</Text>
              <Text style={styles.stepDescription} numberOfLines={1}>
                {localized?.description ?? step.description}
              </Text>
              </View>
            </View>
          );
        })}
      </View>
      {remainingCount > 0 ? (
        <Text style={styles.footerText}>{copy.footer(remainingCount)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.divider,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },
  list: {
    marginTop: 6,
    gap: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listIcon: {
    fontSize: 18,
    width: 22,
    textAlign: 'center',
  },
  listCopy: {
    flex: 1,
    gap: 2,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  stepDescription: {
    fontSize: 12,
    lineHeight: 15,
    color: COLORS.textSecondary,
  },
  footerText: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
