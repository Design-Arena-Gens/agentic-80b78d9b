import { NextResponse, type NextRequest } from "next/server";
import type {
  DesignEvolutionSuggestion,
  DesignProfile,
} from "@/types";

interface DesignPayload {
  profile: DesignProfile;
}

const MODEL =
  process.env.GEMINI_LIVE_MODEL ?? "gemini-1.5-pro-exp-0827";

export async function POST(request: NextRequest) {
  const { profile } = (await request.json()) as DesignPayload;
  if (!profile) {
    return NextResponse.json(
      { error: "Design profile is required." },
      { status: 400 },
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      suggestion: fallbackSuggestion(profile),
      source: "fallback",
    });
  }

  const requestPrompt = buildPrompt(profile);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: requestPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.65,
          topP: 0.9,
          topK: 32,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  const data = await response.json();
  if (!response.ok) {
    const errorMessage =
      data?.error?.message ??
      data?.error ??
      "Design suggestion request failed.";
    return NextResponse.json(
      { error: errorMessage },
      { status: response.status },
    );
  }

  const candidate = data.candidates?.[0];
  const rawText =
    candidate?.content?.parts?.[0]?.text ??
    candidate?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("") ??
    "";

  try {
    const parsed = JSON.parse(rawText) as DesignEvolutionSuggestion;
    return NextResponse.json({ suggestion: parsed, source: "gemini" });
  } catch (error) {
    console.warn("Failed to parse Gemini design response", error, rawText);
    return NextResponse.json({
      suggestion: fallbackSuggestion(profile),
      source: "fallback",
      warning: "Gemini response was not valid JSON. Returning fallback.",
    });
  }
}

function buildPrompt(profile: DesignProfile) {
  return [
    "You are an adaptive UI systems director for a mobile-first agentic console.",
    "Given the current design profile, output JSON describing the next evolution.",
    "",
    "Respond with JSON using the following schema:",
    `{
  "summary": "Quick story about the vibe shift.",
  "palette": {
    "primary": "<hex>",
    "accent": "<hex>",
    "background": "<css color or gradient>",
    "surfaces": ["<rgba or css color>", "..."]
  },
  "layout": {
    "density": "cozy | balanced | airy",
    "cornerStyle": "rounded | ultra-rounded | sharp",
    "shadowStyle": "soft | vivid | minimal"
  },
  "enhancements": ["<bullet 1>", "<bullet 2>", "<bullet 3>"]
}`,
    "",
    "Current design profile to evolve:",
    JSON.stringify(profile, null, 2),
    "",
    "Constraints:",
    "- Keep output as valid JSON only (no additional commentary).",
    "- Emphasize gradients and luminous glass surfaces for an agentic brand.",
  ].join("\n");
}

function fallbackSuggestion(profile: DesignProfile): DesignEvolutionSuggestion {
  return {
    summary:
      "Dial up the aurora energy with a cooler teal sweep and sculpted frosted surfaces.",
    palette: {
      primary: shade(profile.primaryColor, 0.85),
      accent: tint(profile.accentColor, 1.1),
      background:
        "radial-gradient(circle at 10% -10%, rgba(91, 33, 182, 0.3), transparent 60%), radial-gradient(circle at 80% 10%, rgba(0, 194, 255, 0.26), transparent 65%), #05010e",
      surfaces: [
        "rgba(12, 8, 35, 0.72)",
        "rgba(15, 20, 48, 0.56)",
        "rgba(69, 235, 255, 0.12)",
      ],
    },
    layout: {
      density: "balanced",
      cornerStyle: "ultra-rounded",
      shadowStyle: "vivid",
    },
    enhancements: [
      "Introduce aurora threads animating subtly across the hero card.",
      "Edge-light primary buttons with a cyan core and soft magenta outer glow.",
      "Layer in micro-depth using parallax glass panels over the voice canvas.",
    ],
  };
}

function shade(color: string, factor: number) {
  try {
    const { r, g, b } = hexToRgb(color);
    const next = {
      r: clamp(Math.round(r * factor), 0, 255),
      g: clamp(Math.round(g * factor), 0, 255),
      b: clamp(Math.round(b * factor), 0, 255),
    };
    return rgbToHex(next);
  } catch {
    return color;
  }
}

function tint(color: string, factor: number) {
  try {
    const { r, g, b } = hexToRgb(color);
    const next = {
      r: clamp(Math.round(r * factor), 0, 255),
      g: clamp(Math.round(g * factor), 0, 255),
      b: clamp(Math.round(b * factor), 0, 255),
    };
    return rgbToHex(next);
  } catch {
    return color;
  }
}

function hexToRgb(hex: string) {
  const parsed = hex.replace("#", "");
  if (![3, 6].includes(parsed.length)) {
    throw new Error(`Invalid hex color ${hex}`);
  }
  const normalized =
    parsed.length === 3
      ? parsed
          .split("")
          .map((char) => char.repeat(2))
          .join("")
      : parsed;
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return (
    "#" +
    [r, g, b]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
