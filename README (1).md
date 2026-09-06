# STAMS AI Assistant

A single-page, mobile-friendly web app that explains the STAMS SCADA/EMS project
in simple terms, grounded in the project training material, with diagram support.

Runs on **Google's Gemini API (free tier)** via a small Vercel serverless proxy.

## Required setup: Gemini API key (free)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey) and sign in with
   a Google account.
2. Click **Create API key**. No credit card required for the free tier.
3. In your Vercel project: **Settings → Environment Variables**
   - Name: `GEMINI_API_KEY`
   - Value: your key
   - Environment: Production (and Preview, if you want branch previews to work too)
4. Redeploy (Vercel → Deployments → ⋯ → Redeploy), or just push a new commit.

Free tier limits (subject to change by Google) are roughly 15 requests/minute
and ~1,500 requests/day on `gemini-2.5-flash` — far more than enough for
personal learning use.

If you ever want a different model, set an optional `GEMINI_MODEL` environment
variable (e.g. `gemini-2.5-flash-lite` for higher throughput, lower quality).

## How the AI calls work

- `index.html` is the static frontend. It sends each question to `/api/chat`
  on your own domain — never directly to Google.
- `api/chat.js` is a Vercel serverless function. It reads `GEMINI_API_KEY`
  from the server environment (never sent to the browser), converts the chat
  history into Gemini's request format, and calls
  `https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`,
  then relays the answer back as `{ text: "..." }`.

This proxy is required because API keys can't safely live in browser-side
code — anyone could open dev tools and steal it.

## Notes
- No build step, no npm install needed — `api/chat.js` uses only built-in
  Node.js `fetch`, and Vercel auto-detects it as a serverless function.
- No live web search in this version (the free Gemini tier here isn't wired
  with search grounding) — the assistant answers from the STAMS training
  material baked into its instructions, plus its own general knowledge, and
  says so when a question is outside that.
- Fully responsive: on screens under 760px, the sidebar collapses into a
  horizontally-scrollable topic strip under the header, touch targets are sized
  for mobile, and the layout accounts for iOS safe areas and the mobile viewport
  height quirk.

## Deploy to Vercel (if starting fresh)

**Option A — Vercel CLI**
```bash
npm i -g vercel
cd stams-ai-assistant
vercel
```

**Option B — Vercel dashboard**
1. Push this folder to a GitHub repo (or drag-and-drop the folder at vercel.com/new).
2. Import the repo in Vercel → Framework Preset: **Other** → no build command needed.
3. Add the `GEMINI_API_KEY` environment variable (see above) before or after the first deploy.
4. Deploy.
