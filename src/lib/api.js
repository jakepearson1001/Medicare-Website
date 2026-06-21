// Client-side wrapper for the food-vision feature.
//
// The browser NEVER sees the Anthropic API key. It POSTs the photo to our own
// serverless proxy at /api/analyze-food, which holds the key server-side and
// calls Claude. If the proxy is unavailable or no key is configured, this
// throws and the Log screen falls back to manual entry.

/**
 * @param {string} dataUrl  base64 data URL of the food photo
 * @returns {Promise<{items: Array<{name,qty,calories,protein,carbs,fat}>}>}
 */
export async function analyzeFoodPhoto(dataUrl) {
  const comma = dataUrl.indexOf(',');
  const meta = dataUrl.slice(0, comma);
  const base64 = dataUrl.slice(comma + 1);
  const mediaType = (meta.match(/data:(.*?);base64/) || [])[1] || 'image/jpeg';

  let res;
  try {
    res = await fetch('/api/analyze-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64, mediaType }),
    });
  } catch (e) {
    throw new Error('OFFLINE_OR_NO_PROXY');
  }

  if (res.status === 404) throw new Error('NO_PROXY');
  if (res.status === 501) throw new Error('NO_KEY');
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`API_ERROR:${res.status}:${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  if (!data || !Array.isArray(data.items)) {
    throw new Error('BAD_RESPONSE');
  }
  // Normalize numbers defensively.
  data.items = data.items.map((it) => ({
    name: String(it.name || 'Food item'),
    qty: Number(it.qty) || 1,
    calories: Math.max(0, Math.round(Number(it.calories) || 0)),
    protein: Math.max(0, Math.round(Number(it.protein) || 0)),
    carbs: Math.max(0, Math.round(Number(it.carbs) || 0)),
    fat: Math.max(0, Math.round(Number(it.fat) || 0)),
  }));
  return data;
}

export function friendlyApiError(err) {
  const msg = err?.message || '';
  if (msg.startsWith('NO_KEY')) return 'No API key configured on the server — enter foods manually below.';
  if (msg.startsWith('NO_PROXY') || msg.startsWith('OFFLINE'))
    return 'Photo analysis needs the server proxy (and network). Enter foods manually below.';
  if (msg.startsWith('API_ERROR')) return 'The analysis service returned an error — enter foods manually below.';
  return 'Could not analyze the photo — enter foods manually below.';
}
