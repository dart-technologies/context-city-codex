import { DecisionLog } from '../types/highlight';

const STALE_THRESHOLD_HOURS = 12;
const SENSITIVE_KEY_PATTERNS = [/email/i, /phone/i, /user.?id/i, /token/i, /secret/i, /device/i];

export type GovernanceWarning = 'missing_last_updated' | 'stale_decision_log' | 'sensitive_metadata';

export interface GovernanceReview {
  status: 'approved' | 'flagged';
  warnings: GovernanceWarning[];
  sanitizedLog: DecisionLog;
  lastUpdated?: string;
}

export function auditDecisionLog(decisionLog: DecisionLog): GovernanceReview {
  const metadata = decisionLog.metadata ?? {};
  const sanitizedMetadata: Record<string, unknown> = {};
  const warnings: GovernanceWarning[] = [];

  const lastUpdatedRaw = metadata.last_updated;
  if (typeof lastUpdatedRaw !== 'string' || !lastUpdatedRaw) {
    warnings.push('missing_last_updated');
  } else {
    sanitizedMetadata.last_updated = lastUpdatedRaw;
    const parsedDate = new Date(lastUpdatedRaw);
    if (!Number.isNaN(parsedDate.getTime())) {
      const ageHours = Math.abs(Date.now() - parsedDate.getTime()) / (1000 * 60 * 60);
      if (ageHours > STALE_THRESHOLD_HOURS) {
        warnings.push('stale_decision_log');
      }
    }
  }

  for (const [key, value] of Object.entries(metadata)) {
    if (key === 'last_updated') {
      continue;
    }

    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive) {
      warnings.push('sensitive_metadata');
      continue;
    }

    sanitizedMetadata[key] = value;
  }

  const sanitizedLog: DecisionLog = {
    ...decisionLog,
    metadata: sanitizedMetadata,
  };

  const uniqueWarnings = [...new Set(warnings)];
  const status: GovernanceReview['status'] = uniqueWarnings.length === 0 ? 'approved' : 'flagged';

  return {
    status,
    warnings: uniqueWarnings,
    sanitizedLog,
    lastUpdated: typeof lastUpdatedRaw === 'string' ? lastUpdatedRaw : undefined,
  };
}
