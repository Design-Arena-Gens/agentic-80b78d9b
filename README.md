## Hyperwave Agentic Voice Studio

Mobile-first Gemini Live companion with agentic design controls, multimodal voice orchestration, and integration management ready for Vercel deployment.

### ✨ Highlights
- Live voice assistant built around Gemini Live API with audio capture, speech playback, and persona switching.
- Mode Studio to compose new assistant personas, remix system prompts, and tweak tone/skills on the fly.
- Integration Board for managing MCP servers, external APIs, and data sources that fuel the assistant context.
- Agentic Design evolution panel that lets Gemini propose fresh gradients, palettes, and UI enhancements with one tap.
- Local persistence (via `localStorage`) so custom modes/designs survive page refreshes.

### 🧱 Tech Stack
- [Next.js 16 (App Router, TypeScript, React 19)](https://nextjs.org/)
- Tailwind CSS v4
- Edge-ready API routes for Gemini Live + design evolution
- Modern browser Web APIs (MediaRecorder, Speech Synthesis)

### 🚀 Quick Start
```bash
npm install
npm run dev
```
Visit `http://localhost:3000` to explore the studio.

### 🔑 Environment
Create `.env.local` (or configure in Vercel) with:
```
GEMINI_API_KEY=your_google_gemini_key
# Optional: override live model
GEMINI_LIVE_MODEL=gemini-1.5-pro-exp-0827
```
Without an API key the UI still works; voice responses fall back to descriptive messaging and design evolution returns on-device suggestions.

### 📦 Production Build & Deploy
```bash
npm run build
npm run start
# or deploy directly to Vercel
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-80b78d9b
```

### 🧪 Scripts
- `npm run dev` – local development server
- `npm run build` – production build
- `npm run start` – serve the compiled app
- `npm run lint` – lint the project

### 🛠 Maintenance Notes
- Custom assistant modes, connectors, and design profiles persist per-browser via local storage.
- Gemini routes include structured fallbacks and descriptive errors for easier debugging.
- Modular component design (`src/components`) keeps the console ready for new panels or workflows.
