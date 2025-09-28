import app from '../services/highlights-api/src/server.js';

export default function handler(request, response) {
  console.log('[api] incoming request', request.url, request.method);
  return app(request, response);
}
