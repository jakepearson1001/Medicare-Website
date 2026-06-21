// Vercel serverless entry for the food-photo calorie estimator.
// The actual logic lives in ../server/analyzeFood.js so it can be shared with
// the Vite dev/preview middleware (see vite.config.js) for Replit/local use.

import { analyzeFood } from '../server/analyzeFood.js';

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try {
      return JSON.parse(req.body);
    } catch {
      /* fall through to stream read */
    }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  try {
    const data = await analyzeFood(body);
    return res.status(200).json(data);
  } catch (e) {
    const status = e?.status && e.status >= 400 && e.status < 600 ? e.status : 500;
    return res.status(status).json({
      error: e?.code || 'ANALYSIS_FAILED',
      detail: String(e?.message || e).slice(0, 300),
    });
  }
}
