import { NextResponse, type NextRequest } from "next/server";
import type { Connector, DesignProfile } from "@/types";

interface LiveRequestPayload {
  modeId: string;
  audioBase64?: string;
  prompt?: string;
  history?: Array<{
    role: "user" | "assistant" | "system";
    text: string;
    modeId: string;
  }>;
  connectors?: Connector[];
  designProfile?: DesignProfile;
}

const MODEL =
  process.env.GEMINI_LIVE_MODEL ?? "gemini-1.5-pro-exp-0827";

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not configured. Provide an API key to enable live interactions.",
      },
      { status: 500 },
    );
  }

  const payload = (await request.json()) as LiveRequestPayload;

  if (!payload.modeId) {
    return NextResponse.json(
      { error: "modeId is required." },
      { status: 400 },
    );
  }

  if (!payload.audioBase64 && !payload.prompt) {
    return NextResponse.json(
      {
        error:
          "Submit either audioBase64 or prompt content for Gemini Live to process.",
      },
      { status: 400 },
    );
  }

  const systemPrompt = createSystemInstruction(
    payload.modeId,
    payload.connectors ?? [],
    payload.designProfile,
  );

  const historyContents =
    payload.history
      ?.filter((entry) => entry.text && entry.text.trim().length > 0)
      .map((entry) => ({
        role: entry.role,
        parts: [{ text: entry.text }],
      })) ?? [];

  const userParts: Array<Record<string, unknown>> = [];
  if (payload.prompt?.trim()) {
    userParts.push({ text: payload.prompt.trim() });
  }

  if (payload.audioBase64) {
    userParts.push({
      inline_data: {
        mime_type: "audio/webm;codecs=opus",
        data: payload.audioBase64,
      },
    });
  }

  const body = {
    systemInstruction: {
      role: "system",
      parts: [{ text: systemPrompt }],
    },
    contents: [
      ...historyContents,
      {
        role: "user",
        parts: userParts,
      },
    ],
    generationConfig: {
      temperature: 0.85,
      topP: 0.95,
      topK: 32,
      responseMimeType: "text/plain",
    },
  };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data?.error?.message ??
      data?.error ??
      "Gemini Live request failed unexpectedly.";
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: response.status },
    );
  }

  const candidate = data.candidates?.[0];
  const parts: unknown[] = candidate?.content?.parts ?? [];
  const text = parts
    .map((part) => {
      if (typeof part === "object" && part !== null) {
        const maybeText = (part as { text?: unknown }).text;
        if (typeof maybeText === "string") {
          return maybeText;
        }
      }
      return "";
    })
    .join("\n")
    .trim();

  const connectorContext =
    payload.connectors
      ?.filter((connector) => connector.status === "active")
      .map(
        (connector) =>
          `${connector.name} · ${connector.capabilities
            .slice(0, 3)
            .join(", ")}`,
      ) ?? [];

  return NextResponse.json({
    text,
    connectorContext,
    raw: data,
  });
}

function createSystemInstruction(
  modeId: string,
  connectors: Connector[],
  designProfile?: DesignProfile,
) {
  const activeConnectors = connectors
    .filter((connector) => connector.status === "active")
    .map(
      (connector) =>
        `• ${connector.name} (${connector.type}) → ${connector.capabilities.join(", ")}`,
    )
    .join("\n")
    .trim() || "• No live connectors. Assume first-principles reasoning.";

  const designDescriptor = designProfile
    ? `Primary: ${designProfile.primaryColor} | Accent: ${designProfile.accentColor} | Background: ${designProfile.backgroundGradient}. Layout density ${designProfile.layout.density}. Corner style ${designProfile.layout.cornerStyle}.`
    : "Design profile unspecified. Default to calm glassmorphism with luminous gradients.";

  return [
    `You are the Gemini Live voice for mode "${modeId}".`,
    "Goals:",
    "1. Respond crisply with cinematic detail yet mobile-friendly brevity.",
    "2. Surface what needs to be auto-implemented next when users ask for new modes, MCP servers, or APIs.",
    "3. Provide interaction-ready copy that can be read aloud while remaining visually descriptive.",
    "",
    "Active connector graph:",
    activeConnectors,
    "",
    "Current design DNA:",
    designDescriptor,
    "",
    "When returning suggestions, highlight:",
    "• Visual upgrades or screen alterations.",
    "• Interaction or motion cues.",
    "• Integration requirements (new MCP servers or APIs) with the payload shape needed.",
    "",
    "Always end with a crisp recommendation for the next hands-on action the builder can take.",
  ].join("\n");
}
