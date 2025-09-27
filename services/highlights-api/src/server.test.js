import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

process.env.NODE_ENV = 'test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-feedback-'));
const tempLogPath = path.join(tempDir, 'feedback.log');
process.env.FEEDBACK_LOG_PATH = tempLogPath;
process.env.HIGHLIGHTS_DIR = path.resolve(__dirname, '../data/highlights');

const { default: app } = await import('./server.js');

function startServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
    server.on('error', reject);
  });
}

test('GET /api/highlights/:poiId returns highlight payload', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const res = await fetch(`${baseUrl}/api/highlights/poi-felix`);
    assert.equal(res.status, 200);
    const payload = await res.json();
    assert.equal(payload.summary.id, 'poi-felix');
    assert.equal(payload.narrative.rationale.reasons.length > 0, true);
    assert.ok(payload.narrative.script);
    assert.ok(payload.narrative.codexierge);
  } finally {
    server.close();
  }
});

test('GET /api/highlights/:poiId handles missing record', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const res = await fetch(`${baseUrl}/api/highlights/unknown-poi`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.error, 'POI_NOT_FOUND');
  } finally {
    server.close();
  }
});

test('POST /api/feedback persists entry', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const res = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ highlightId: 'poi-felix', wasHelpful: true, context: 'Loved the rationale' }),
    });
    assert.equal(res.status, 202);
    const logContent = fs.readFileSync(tempLogPath, 'utf-8').trim().split('\n');
    assert.ok(logContent.length > 0);
    const lastEntry = JSON.parse(logContent.at(-1));
    assert.equal(lastEntry.highlightId, 'poi-felix');
    assert.equal(lastEntry.wasHelpful, true);
  } finally {
    server.close();
  }
});

test('POST /api/telemetry accepts events', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const res = await fetch(`${baseUrl}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'codex_rationale_viewed', payload: { highlightId: 'poi-felix' } }),
    });
    assert.equal(res.status, 202);
    const logContent = fs.readFileSync(tempLogPath, 'utf-8').trim().split('\n');
    const lastEntry = JSON.parse(logContent.at(-1));
    assert.ok(lastEntry.telemetry);
    assert.equal(lastEntry.telemetry.event, 'codex_rationale_viewed');
  } finally {
    server.close();
  }
});
