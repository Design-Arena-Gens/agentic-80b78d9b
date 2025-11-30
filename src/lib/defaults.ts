import { AssistantMode, Connector, DesignProfile } from "@/types";

export const defaultModes: AssistantMode[] = [
  {
    id: "aether",
    name: "Aether Composer",
    description:
      "Spatial-first creative director that riffs on motion, gradients, and immersive UI patterns.",
    systemInstruction:
      "You are Aether Composer, a multimodal design partner focused on high-impact visual and interaction upgrades. Blend conversation design with motion cues, and surface what should be auto-implemented next for a Vercel-ready app.",
    tone: "Visionary, confident, descriptive yet succinct.",
    waveformColor: "#7a5bff",
    highlightGradient: "from-violet-500 via-purple-500 to-sky-400",
    tags: ["design", "storyboarding", "motion"],
    defaultOpeners: [
      "Where should we take the interface next?",
      "Let's evolve the surfaces around your core flows.",
    ],
    capabilities: [
      "Realtime co-creation",
      "Moodboard synthesis",
      "Interaction prototyping",
    ],
  },
  {
    id: "sentience",
    name: "Sentience Navigator",
    description:
      "Systems-level operator that manages MCP graphs, external APIs, and integration scaffolding.",
    systemInstruction:
      "You are Sentience Navigator. Treat each request as an orchestration challenge. Understand new MCP servers, propose contract schemas, and outline zero-downtime upgrades.",
    tone: "Analytical, pragmatic, system-level clarity.",
    waveformColor: "#06b6d4",
    highlightGradient: "from-cyan-400 via-teal-400 to-emerald-400",
    tags: ["architecture", "mcp", "resilience"],
    defaultOpeners: [
      "Which capability graph should we expand?",
      "Ready to onboard a new integration—what's the target API?",
    ],
    capabilities: [
      "Connector modeling",
      "API surface synthesis",
      "Operational playbooks",
    ],
  },
  {
    id: "lumen",
    name: "Lumen Caretaker",
    description:
      "Conversational flow engineer that tunes voice guidance, tone adaptation, and accessibility.",
    systemInstruction:
      "You are Lumen Caretaker. Shape gentle but precise voice-first journeys, anticipate edge cases, and keep the experience grounded in inclusive design.",
    tone: "Empathetic, precise, human-centered.",
    waveformColor: "#f97316",
    highlightGradient: "from-amber-400 via-orange-400 to-rose-400",
    tags: ["voice", "ux writing", "accessibility"],
    defaultOpeners: [
      "Let's orchestrate the next voice path together.",
      "Who are we guiding, and what tone should land?",
    ],
    capabilities: [
      "Voice UX scripting",
      "Edge-case simulation",
      "Emotional tone tuning",
    ],
  },
];

export const defaultConnectors: Connector[] = [
  {
    id: "mcp-atlas",
    name: "Atlas Research Graph",
    type: "mcp",
    endpoint: "wss://atlas.mcp.design/live",
    status: "active",
    description:
      "Live graph of design systems, trend reports, and annotated UI references.",
    capabilities: ["semantic-search", "pattern-mining", "snapshot-exports"],
    lastSync: "5m ago",
  },
  {
    id: "api-journey",
    name: "Journey Analytics API",
    type: "api",
    endpoint: "https://journey-analytics.internal/api/v2",
    status: "draft",
    description:
      "Session insights and friction signals sourced from production analytics.",
    capabilities: ["heatmaps", "drop-off-analysis", "persona-clustering"],
    lastSync: "1h ago",
  },
  {
    id: "datasource-synth",
    name: "Synth Feedback Lake",
    type: "datasource",
    endpoint: "s3://agentic-design/feedback",
    status: "paused",
    description:
      "Aggregated voice notes and qualitative interviews for tonal calibration.",
    capabilities: ["nlp", "sentiment", "topic-mapping"],
    lastSync: "12h ago",
  },
];

export const defaultDesignProfile: DesignProfile = {
  id: "hyperwave",
  name: "Hyperwave Aurora",
  primaryColor: "#6c4afe",
  accentColor: "#0dd4ff",
  backgroundGradient:
    "radial-gradient(circle at top, rgba(108,74,254,0.28), transparent 55%), radial-gradient(circle at bottom, rgba(13,212,255,0.24), transparent 60%), #05010e",
  surfaceAlpha: 0.18,
  blurIntensity: 24,
  borderGlow: 32,
  typography: {
    heading: "Geist Sans",
    body: "Geist Sans",
    monospace: "Geist Mono",
  },
  layout: {
    density: "balanced",
    cornerStyle: "ultra-rounded",
    shadowStyle: "vivid",
  },
  voiceProfile: {
    handoffInstruction:
      "Switch to direct, energetic narration when escalating to a live operator. Reflect user terminology exactly.",
    promptPrimer:
      "Always confirm the mode persona, cite active connectors, and describe visual or motion updates explicitly.",
  },
};
