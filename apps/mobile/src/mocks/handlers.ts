import { http, HttpResponse, passthrough } from './msw-bridge';
import { highlightMocks } from './felix';

const highlights = Object.fromEntries(
  Object.entries(highlightMocks).map(([id, data]) => [id, data])
);

export const handlers = [
  http.get('/api/highlights/:poiId', ({ params }) => {
    const { poiId } = params as { poiId: string };
    const record = highlights[poiId];
    if (!record) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(record, { status: 200 });
  }),

  http.post('/api/feedback', async (request) => {
    const body = await request.json().catch(() => ({}));
    console.log('[msw] Feedback received', body);
    return HttpResponse.json({ ok: true }, { status: 202 });
  }),

  http.post('/api/telemetry', async (request) => {
    const body = await request.json().catch(() => ({}));
    console.log('[msw] Telemetry received', body);
    return HttpResponse.json({ ok: true }, { status: 202 });
  }),

  http.all('*', () => passthrough()),
];
