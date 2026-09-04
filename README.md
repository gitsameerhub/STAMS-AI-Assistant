# STAMS AI Assistant

A single-page, mobile-friendly web app that explains the STAMS SCADA/EMS project
in simple terms, grounded in the project training material, with diagram support
and web search for anything outside it.

## Deploy to Vercel

**Option A — Vercel CLI**
```bash
npm i -g vercel
cd stams-ai-assistant
vercel
```
Follow the prompts (link/create a project, accept defaults). Vercel will detect
this as a static site automatically since it only contains `index.html`.

**Option B — Vercel dashboard**
1. Push this folder to a GitHub repo (or drag-and-drop the folder at vercel.com/new).
2. Import the repo in Vercel → Framework Preset: **Other** → no build command needed.
3. Deploy.

## Notes
- This is a static HTML file — no build step, no dependencies to install.
- It calls the Anthropic API directly from the browser (`api.anthropic.com`), the
  same way it does inside a Claude.ai artifact, so no server or API key setup is
  needed on your end.
- Fully responsive: on screens under 760px, the sidebar collapses into a
  horizontally-scrollable topic strip under the header, touch targets are sized
  for mobile, and the layout accounts for iOS safe areas and the mobile viewport
  height quirk.
