import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultHighlightsDir = path.resolve(__dirname, '../data/highlights');
const highlightsDir = process.env.HIGHLIGHTS_DIR ? path.resolve(process.env.HIGHLIGHTS_DIR) : defaultHighlightsDir;
const resolvedLogPath = (() => {
  if (process.env.FEEDBACK_LOG_PATH) {
    return path.resolve(process.env.FEEDBACK_LOG_PATH);
  }
  if (process.env.VERCEL) {
    return path.join('/tmp', 'feedback.log');
  }
  return path.resolve(__dirname, '../data/feedback.log');
})();

const logPathDir = path.dirname(resolvedLogPath);
if (!fs.existsSync(logPathDir)) {
  fs.mkdirSync(logPathDir, { recursive: true });
}

const logPath = resolvedLogPath;

function appendLog(entry) {
  fs.appendFileSync(logPath, `${JSON.stringify(entry)}\n`);
}

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
  const locale = req.query.locale;

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
    appendLog(entry);
  } catch (error) {
    console.error('feedback.write.failure', error);
    return res.status(503).json({ error: 'FEEDBACK_WRITE_FAILURE', message: 'Could not persist feedback at this time.' });
  }

  console.info(JSON.stringify({ event: 'feedback.received', highlightId, wasHelpful, feedbackId: entry.id }));
  return res.status(202).json({ status: 'accepted' });
});

app.post('/api/telemetry', (req, res) => {
  const payload = req.body ?? {};
  const entry = {
    id: crypto.randomUUID(),
    event: typeof payload.event === 'string' ? payload.event : 'unknown',
    payload: payload.payload ?? {},
    receivedAt: new Date().toISOString(),
  };

  try {
    appendLog({ telemetry: entry });
  } catch (error) {
    console.error('telemetry.write.failure', error);
    return res.status(503).json({ error: 'TELEMETRY_WRITE_FAILURE', message: 'Unable to log telemetry event.' });
  }

  console.info(JSON.stringify({ event: 'telemetry.received', telemetryId: entry.id, type: entry.event }));
  return res.status(202).json({ status: 'accepted' });
});

app.use((err, req, res, next) => {
  console.error('highlight.fetch.failure', err);
  res.status(503).json({ error: 'HIGHLIGHT_SERVICE_FAILURE', message: 'Unable to load highlight narrative at this time.' });
});

export default app;
