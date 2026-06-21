// Shared food-photo analysis logic, used by BOTH:
//   - the Vercel serverless function (api/analyze-food.js)
//   - the Vite dev/preview middleware (vite.config.js) — so it works on Replit
//
// The Anthropic API key is read from the server environment at call time and is
// never exposed to the browser.

import Anthropic from '@anthropic-ai/sdk';

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

function err(message, status, code) {
  const e = new Error(message);
  e.status = status;
  e.code = code || message;
  return e;
}

/**
 * @param {{base64?: string, mediaType?: string}} input
 * @returns {Promise<{items: Array}>}
 */
export async function analyzeFood({ base64, mediaType } = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw err('NO_KEY', 501, 'NO_KEY');
  if (!base64) throw err('Missing image data', 400, 'NO_IMAGE');

  const model = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    output_config: { format: { type: 'json_schema', schema: FOOD_SCHEMA } },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: base64 },
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

  const textBlock = message.content.find((b) => b.type === 'text');
  const parsed = JSON.parse(textBlock.text);
  return { items: parsed.items || [] };
}
