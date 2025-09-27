import { auditDecisionLog } from '../governance';
import { DecisionLog } from '../../types/highlight';

describe('auditDecisionLog', () => {
  it('approves a fresh decision log and preserves metadata', () => {
    const log: DecisionLog = {
      highlightId: 'poi-felix',
      reasons: [],
      metadata: {
        last_updated: new Date().toISOString(),
        distance: '0.4 mi',
      },
    };

    const review = auditDecisionLog(log);

    expect(review.status).toBe('approved');
    expect(review.warnings).toHaveLength(0);
    expect(review.sanitizedLog.metadata).toMatchObject({
      last_updated: log.metadata?.last_updated,
      distance: '0.4 mi',
    });
  });

  it('flags stale or sensitive metadata and strips it from the surface payload', () => {
    const staleTimestamp = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
    const log: DecisionLog = {
      highlightId: 'poi-felix',
      reasons: [],
      metadata: {
        last_updated: staleTimestamp,
        email: 'traveler@example.com',
      },
    };

    const review = auditDecisionLog(log);

    expect(review.status).toBe('flagged');
    expect(review.warnings).toEqual(expect.arrayContaining(['stale_decision_log', 'sensitive_metadata']));
    expect(review.sanitizedLog.metadata).not.toHaveProperty('email');
    expect(review.sanitizedLog.metadata).toHaveProperty('last_updated', staleTimestamp);
  });
});
