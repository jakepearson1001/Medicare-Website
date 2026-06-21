// Serverless proxy for the food-photo calorie estimator.
//
// The Anthropic API key lives ONLY on the server (process.env.ANTHROPIC_API_KEY)
// and is never shipped to the browser. The client POSTs a base64 photo here; we
// ask a vision-capable Claude model to identify foods and return structured
// nutrition JSON, then hand that back to the client.
//
// Works as a Vercel serverless function (default export handler). If no key is
// configured we return 501 so the Log screen can fall back to manual entry.

import Anthropic from '@anthropic-ai/sdk';

// Default to the most capable Claude model; override with ANTHROPIC_MODEL.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

const FOOD_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    items: {
      type: 'array',
      description: 'One entry per distinct food item visible in the photo.',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string', description: 'Short name of the food item.' },
          qty: { type: 'number', description: 'Estimated number of servings/portions shown.' },
          calories: { type: 'number', description: 'Estimated total kcal for the quantity shown.' },
          protein: { type: 'number', description: 'Estimated grams of protein.' },
          carbs: { type: 'number', description: 'Estimated grams of carbohydrates.' },
          fat: { type: 'number', description: 'Estimated grams of fat.' },
        },
        required: ['name', 'qty', 'calories', 'protein', 'carbs', 'fat'],
      },
    },
  },
  required: ['items'],
};

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // No key configured — the client falls back to manual entry.
    return res.status(501).json({ error: 'NO_KEY' });
  }

  let base64, mediaType;
  try {
    const body = await readJsonBody(req);
    base64 = body.base64;
    mediaType = body.mediaType || 'image/jpeg';
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  if (!base64) return res.status(400).json({ error: 'Missing image data' });

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: {
        format: { type: 'json_schema', schema: FOOD_SCHEMA },
      },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text:
                'Identify every food and drink in this photo. For each item, estimate ' +
                'the quantity shown and its nutrition: total calories (kcal) plus grams ' +
                'of protein, carbs, and fat for the portion visible. Estimate reasonably ' +
                'from typical serving sizes; these are approximate. Return only the ' +
                'structured data.',
            },
          ],
        },
      ],
    });

    // With output_config.format, the model returns JSON as the text block.
    const textBlock = message.content.find((b) => b.type === 'text');
    const parsed = JSON.parse(textBlock.text);
    return res.status(200).json({ items: parsed.items || [] });
  } catch (err) {
    const status = err?.status || 500;
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      error: 'ANALYSIS_FAILED',
      detail: String(err?.message || err).slice(0, 300),
    });
  }
}
