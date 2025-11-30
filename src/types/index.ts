export interface AssistantMode {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  tone: string;
  waveformColor: string;
  highlightGradient: string;
  tags: string[];
  defaultOpeners: string[];
  capabilities: string[];
}

export interface Connector {
  id: string;
  name: string;
  type: "mcp" | "api" | "datasource";
  endpoint: string;
  status: "active" | "paused" | "draft";
  description: string;
  capabilities: string[];
  lastSync: string;
}

export interface DesignProfile {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundGradient: string;
  surfaceAlpha: number;
  blurIntensity: number;
  borderGlow: number;
  typography: {
    heading: string;
    body: string;
    monospace: string;
  };
  layout: {
    density: "cozy" | "balanced" | "airy";
    cornerStyle: "rounded" | "ultra-rounded" | "sharp";
    shadowStyle: "soft" | "vivid" | "minimal";
  };
  voiceProfile: {
    handoffInstruction: string;
    promptPrimer: string;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  modeId: string;
  createdAt: number;
  connectorContext?: string[];
  audioUrl?: string;
}

export interface DesignEvolutionSuggestion {
  summary: string;
  palette: {
    primary: string;
    accent: string;
    background: string;
    surfaces: string[];
  };
  layout: {
    density: DesignProfile["layout"]["density"];
    cornerStyle: DesignProfile["layout"]["cornerStyle"];
    shadowStyle: DesignProfile["layout"]["shadowStyle"];
  };
  enhancements: string[];
}
