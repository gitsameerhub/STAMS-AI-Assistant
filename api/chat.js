// Vercel serverless function — POST /api/chat
// Proxies chat requests to Google's Gemini API (free tier), keeping the
// API key on the server. Set GEMINI_API_KEY in your Vercel project's
// Environment Variables (get a key at https://aistudio.google.com/apikey).

const DEFAULT_MODEL = 'gemini-2.5-flash';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'Server misconfiguration',
      details: "GEMINI_API_KEY is not set in this Vercel project's Environment Variables."
    });
    return;
  }

  const { system, messages } = req.body || {};
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  // Gemini uses role "model" instead of "assistant", and a "parts" array
  // instead of a plain content string.
  const contents = (Array.isArray(messages) ? messages : []).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content || '' }]
  }));

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system || '' }] },
          contents,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.6
          }
        })
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      res.status(upstream.status).json({
        error: (data && data.error && data.error.message) || 'Gemini API error',
        details: data
      });
      return;
    }

    const candidate = data.candidates && data.candidates[0];
    const text =
      (candidate &&
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts.map((p) => p.text || '').join('')) ||
      '';

    if (!text) {
      // Most common cause: safety block or hitting maxOutputTokens with no text yet.
      res.status(200).json({
        text: '',
        finishReason: candidate && candidate.finishReason
      });
      return;
    }

    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: 'Proxy request failed', details: String(err) });
  }
};
