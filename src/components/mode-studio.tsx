'use client';

import { useMemo, useState } from "react";
import type { AssistantMode } from "@/types";

interface ModeStudioProps {
  modes: AssistantMode[];
  activeModeId: string;
  onSelectMode: (modeId: string) => void;
  onCreateMode: (mode: AssistantMode) => void;
  onUpdateMode: (mode: AssistantMode) => void;
}

const blankMode = (): AssistantMode => ({
  id: `mode-${Math.random().toString(16).slice(2, 10)}`,
  name: "Untitled Mode",
  description: "",
  systemInstruction: "",
  tone: "Adaptive, succinct",
  waveformColor: "#ffffff",
  highlightGradient: "from-white to-white",
  tags: [],
  defaultOpeners: [],
  capabilities: [],
});

export function ModeStudio({
  modes,
  activeModeId,
  onSelectMode,
  onCreateMode,
  onUpdateMode,
}: ModeStudioProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [draftMode, setDraftMode] = useState<AssistantMode | null>(null);

  const activeMode = useMemo(
    () => modes.find((mode) => mode.id === activeModeId) ?? modes[0],
    [activeModeId, modes],
  );

  function openComposer(mode?: AssistantMode) {
    setDraftMode(mode ? { ...mode } : blankMode());
    setIsComposerOpen(true);
  }

  function closeComposer() {
    setIsComposerOpen(false);
    setDraftMode(null);
  }

  function handleComposerSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draftMode) return;

    const normalized = {
      ...draftMode,
      tags: dedupeTokens(draftMode.tags),
      defaultOpeners: filterEmpty(draftMode.defaultOpeners),
      capabilities: dedupeTokens(draftMode.capabilities),
    };

    if (modes.some((mode) => mode.id === draftMode.id)) {
      onUpdateMode(normalized);
    } else {
      onCreateMode(normalized);
    }
    closeComposer();
  }

  return (
    <section className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/8 p-6 text-white backdrop-blur-xl">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Mode Studio
          </p>
          <h2 className="text-xl font-semibold md:text-2xl">
            Agentic personas
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Toggle agents, remix prompts, and craft new orchestration modes in a
            few taps.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openComposer()}
          className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] transition hover:bg-white/20"
        >
          New mode
        </button>
      </header>

      <div className="space-y-3">
        {modes.map((mode) => (
          <article
            key={mode.id}
            className={`relative flex cursor-pointer flex-col gap-3 rounded-3xl border border-white/10 bg-black/40 p-4 transition hover:border-white/30 ${
              mode.id === activeModeId ? "ring-2 ring-white/60" : ""
            }`}
            onClick={() => onSelectMode(mode.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-white/50">
                  Persona
                </p>
                <h3 className="text-lg font-semibold">{mode.name}</h3>
                <p className="mt-1 text-sm text-white/60">{mode.description}</p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openComposer(mode);
                }}
                className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] transition hover:bg-white/20"
              >
                Remix
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {mode.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-xs text-white/50">
              <p className="uppercase tracking-[0.28em]">Signature tone</p>
              <p className="mt-1 font-medium normal-case tracking-normal">
                {mode.tone}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-white/50">
          Active system prompt
        </p>
        <p className="mt-2 text-sm text-white/70 whitespace-pre-line">
          {activeMode.systemInstruction}
        </p>
      </div>

      {isComposerOpen && draftMode ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 p-4">
          <form
            onSubmit={handleComposerSubmit}
            className="flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-white/10 bg-black/90 p-6 text-white backdrop-blur-xl"
          >
            <h3 className="text-xl font-semibold">
              {modes.some((m) => m.id === draftMode.id)
                ? "Remix mode"
                : "Create new mode"}
            </h3>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-white/70">
                Name
                <input
                  value={draftMode.name}
                  onChange={(event) =>
                    setDraftMode((current) =>
                      current
                        ? { ...current, name: event.target.value }
                        : current,
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-white outline-none"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-white/70">
                Waveform color
                <input
                  value={draftMode.waveformColor}
                  onChange={(event) =>
                    setDraftMode((current) =>
                      current
                        ? { ...current, waveformColor: event.target.value }
                        : current,
                    )
                  }
                  type="color"
                  className="h-10 w-full cursor-pointer rounded-2xl border border-white/10 bg-black/40 p-1"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm text-white/70">
              Description
              <textarea
                value={draftMode.description}
                onChange={(event) =>
                  setDraftMode((current) =>
                    current
                      ? { ...current, description: event.target.value }
                      : current,
                  )
                }
                className="min-h-[90px] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-white/70">
              System instruction
              <textarea
                value={draftMode.systemInstruction}
                onChange={(event) =>
                  setDraftMode((current) =>
                    current
                      ? { ...current, systemInstruction: event.target.value }
                      : current,
                  )
                }
                className="min-h-[120px] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-white/70">
                Tags (comma separated)
                <input
                  value={draftMode.tags.join(", ")}
                  onChange={(event) =>
                    setDraftMode((current) =>
                      current
                        ? {
                            ...current,
                            tags: splitTokens(event.target.value),
                          }
                        : current,
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-white outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-white/70">
                Capabilities (comma separated)
                <input
                  value={draftMode.capabilities.join(", ")}
                  onChange={(event) =>
                    setDraftMode((current) =>
                      current
                        ? {
                            ...current,
                            capabilities: splitTokens(event.target.value),
                          }
                        : current,
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-white outline-none"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm text-white/70">
              Default entry lines (one per row)
              <textarea
                value={draftMode.defaultOpeners.join("\n")}
                onChange={(event) =>
                  setDraftMode((current) =>
                    current
                      ? {
                          ...current,
                          defaultOpeners: splitLines(event.target.value),
                        }
                      : current,
                  )
                }
                className="min-h-[90px] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
              />
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeComposer}
                className="rounded-full bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.22em] transition hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-black"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function splitTokens(value: string): string[] {
  return value
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function dedupeTokens(tokens: string[]): string[] {
  return Array.from(new Set(filterEmpty(tokens.map((token) => token.trim()))));
}

function filterEmpty(inputs: string[]): string[] {
  return inputs.filter(Boolean);
}
