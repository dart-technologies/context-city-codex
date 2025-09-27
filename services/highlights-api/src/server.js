import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const highlightsDir = path.resolve(__dirname, '../data/highlights');
const feedbackLogPath = path.resolve(__dirname, '../data/feedback.log');

function loadHighlight(poiId) {
  const filePath = path.join(highlightsDir, `${poiId}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function computeEtag(payload) {
  return crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex');
}

app.get('/api/highlights/:poiId', (req, res) => {
  const { poiId } = req.params;
  const locale = req.query.locale; // placeholder for future localization adjustments

  const payload = loadHighlight(poiId);

  if (!payload) {
    return res.status(404).json({ error: 'POI_NOT_FOUND', message: `No highlight narrative for ${poiId}` });
  }

  const response = { ...payload };

  if (locale && response.summary) {
    response.summary.locale = locale;
  }

  const etag = computeEtag(response);

  res.setHeader('Cache-Control', 'public, max-age=120');
  res.setHeader('ETag', etag);
  res.setHeader('Content-Type', 'application/json');

  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }

  const requestId = crypto.randomUUID();
  console.info(JSON.stringify({ event: 'highlight.fetch.success', requestId, poiId, locale: locale ?? 'default' }));

  return res.json(response);
});

app.post('/api/feedback', (req, res) => {
  const { highlightId, wasHelpful, context } = req.body ?? {};

  if (typeof highlightId !== 'string' || typeof wasHelpful !== 'boolean') {
    return res.status(400).json({ error: 'INVALID_FEEDBACK', message: 'highlightId (string) and wasHelpful (boolean) are required.' });
  }

  const entry = {
    id: crypto.randomUUID(),
    highlightId,
    wasHelpful,
    context: typeof context === 'string' ? context : undefined,
    receivedAt: new Date().toISOString(),
  };

  try {
    fs.appendFileSync(feedbackLogPath, `${JSON.stringify(entry)}\n`);
  } catch (error) {
    console.error('feedback.write.failure', error);
    return res.status(503).json({ error: 'FEEDBACK_WRITE_FAILURE', message: 'Could not persist feedback at this time.' });
  }

  console.info(JSON.stringify({ event: 'feedback.received', highlightId, wasHelpful, feedbackId: entry.id }));
  return res.status(202).json({ status: 'accepted' });
});

app.use((err, req, res, next) => {
  console.error('highlight.fetch.failure', err);
  res.status(503).json({ error: 'HIGHLIGHT_SERVICE_FAILURE', message: 'Unable to load highlight narrative at this time.' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Highlights API listening on port ${PORT}`);
  });
}

export default app;
