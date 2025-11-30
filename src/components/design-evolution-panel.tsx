'use client';

import { useState } from "react";
import type { DesignEvolutionSuggestion, DesignProfile } from "@/types";

interface DesignEvolutionPanelProps {
  designProfile: DesignProfile;
  onUpdateDesign: (profile: DesignProfile) => void;
}

export function DesignEvolutionPanel({
  designProfile,
  onUpdateDesign,
}: DesignEvolutionPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] =
    useState<DesignEvolutionSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requestEvolution() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gemini/design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: designProfile,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(
          payload?.error ??
            `Design evolution failed with status ${response.status}`,
        );
      }

      const payload = await response.json();
      setSuggestion(payload.suggestion);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Design evolution request failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function applySuggestion() {
    if (!suggestion) return;
    onUpdateDesign({
      ...designProfile,
      primaryColor: suggestion.palette.primary ?? designProfile.primaryColor,
      accentColor: suggestion.palette.accent ?? designProfile.accentColor,
      backgroundGradient:
        suggestion.palette.background ?? designProfile.backgroundGradient,
      layout: {
        ...designProfile.layout,
        density: suggestion.layout.density,
        cornerStyle: suggestion.layout.cornerStyle,
        shadowStyle: suggestion.layout.shadowStyle,
      },
    });
  }

  return (
    <section className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.08] p-6 text-white backdrop-blur-xl">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          Agentic design
        </p>
        <h2 className="text-xl font-semibold md:text-2xl">Design evolution</h2>
        <p className="mt-2 text-sm text-white/70">
          Tune the ambient palette, surface treatments, and experiential cues.
          Let Gemini push the gradients further or weave adaptive modes.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <DesignControl
          label="Primary color"
          value={designProfile.primaryColor}
          onChange={(value) =>
            onUpdateDesign({ ...designProfile, primaryColor: value })
          }
        />
        <DesignControl
          label="Accent color"
          value={designProfile.accentColor}
          onChange={(value) =>
            onUpdateDesign({ ...designProfile, accentColor: value })
          }
        />
        <SliderControl
          label="Surface translucency"
          min={0}
          max={0.4}
          step={0.01}
          value={designProfile.surfaceAlpha}
          onChange={(value) =>
            onUpdateDesign({ ...designProfile, surfaceAlpha: value })
          }
        />
        <SliderControl
          label="Blur intensity"
          min={4}
          max={48}
          step={1}
          value={designProfile.blurIntensity}
          onChange={(value) =>
            onUpdateDesign({ ...designProfile, blurIntensity: value })
          }
        />
        <SliderControl
          label="Border glow"
          min={0}
          max={64}
          step={2}
          value={designProfile.borderGlow}
          onChange={(value) =>
            onUpdateDesign({ ...designProfile, borderGlow: value })
          }
        />
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.22em] text-white/60">
            Layout density
          </label>
          <div className="flex gap-2">
            {(["cozy", "balanced", "airy"] as const).map((density) => (
              <button
                key={density}
                type="button"
                onClick={() =>
                  onUpdateDesign({
                    ...designProfile,
                    layout: { ...designProfile.layout, density },
                  })
                }
                className={`flex-1 rounded-2xl border px-3 py-2 text-sm capitalize transition ${
                  designProfile.layout.density === density
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 text-white/70"
                }`}
              >
                {density}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.22em] text-white/60">
          Background gradient CSS
        </label>
        <textarea
          value={designProfile.backgroundGradient}
          onChange={(event) =>
            onUpdateDesign({
              ...designProfile,
              backgroundGradient: event.target.value,
            })
          }
          className="mt-2 min-h-[90px] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white outline-none"
        />
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-500/40 bg-red-500/20 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={requestEvolution}
          className="rounded-full bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/40"
          disabled={isLoading}
        >
          {isLoading ? "Synthesizing…" : "Ask Gemini to evolve"}
        </button>
        {suggestion ? (
          <div className="space-y-3 rounded-3xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
            <p className="text-xs uppercase tracking-[0.24em] text-white/50">
              Suggested evolution
            </p>
            <p>{suggestion.summary}</p>
            <div className="flex flex-wrap gap-2">
              {suggestion.palette.surfaces.map((color) => (
                <span
                  key={color}
                  style={{ background: color }}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 text-[10px] uppercase tracking-[0.2em]"
                />
              ))}
            </div>
            <ul className="space-y-2 text-xs text-white/60">
              {suggestion.enhancements.map((line, index) => (
                <li key={index}>• {line}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={applySuggestion}
              className="mt-2 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white hover:bg-white/30"
            >
              Apply suggestion
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

interface DesignControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function DesignControl({ label, value, onChange }: DesignControlProps) {
  return (
    <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.22em] text-white/60">
      {label}
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-9 cursor-pointer rounded-xl border border-white/30 bg-transparent p-0"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1 bg-transparent text-sm uppercase tracking-[0.18em] text-white outline-none"
        />
      </div>
    </label>
  );
}

interface SliderControlProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

function SliderControl({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: SliderControlProps) {
  return (
    <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.22em] text-white/60">
      {label}
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-white"
        />
        <span className="text-xs text-white/50">
          {typeof value === "number" ? value.toFixed(2) : value}
        </span>
      </div>
    </label>
  );
}
