import { API_BASE_URL, buildApiUrl } from '../utils/env';

const TELEMETRY_ENDPOINT = '/api/telemetry';

export type TelemetryPayload = Record<string, unknown>;

export async function recordTelemetry(event: string, payload: TelemetryPayload = {}): Promise<void> {
  const body = {
    event,
    payload,
    timestamp: new Date().toISOString(),
    source: 'mobile.codex',
  };

  try {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.info('[telemetry]', event, payload);
    }
  } catch (devError) {
    console.warn('Telemetry dev logging failed', devError);
  }

  if (!API_BASE_URL) {
    return;
  }

  try {
    const response = await fetch(buildApiUrl(TELEMETRY_ENDPOINT), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.warn('Telemetry dispatch failed', response.status);
    }
  } catch (error) {
    console.warn('Telemetry dispatch error', error);
  }
}
