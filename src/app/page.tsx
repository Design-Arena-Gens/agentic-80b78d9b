'use client';

import { useEffect, useMemo, useState } from "react";
import { VoiceAssistant } from "@/components/voice-assistant";
import { ModeStudio } from "@/components/mode-studio";
import { IntegrationBoard } from "@/components/integration-board";
import { DesignEvolutionPanel } from "@/components/design-evolution-panel";
import {
  defaultConnectors,
  defaultDesignProfile,
  defaultModes,
} from "@/lib/defaults";
import type {
  AssistantMode,
  Connector,
  DesignProfile,
} from "@/types";

const STORAGE_KEY = "agentic-voice-studio-state@1";

interface PersistedState {
  modes: AssistantMode[];
  connectors: Connector[];
  designProfile: DesignProfile;
  activeModeId: string;
}

function loadPersistedState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch (error) {
    console.warn("Failed to parse stored studio state", error);
    return null;
  }
}

export default function Home() {
  const persisted = useMemo(() => loadPersistedState(), []);

  const [modes, setModes] = useState<AssistantMode[]>(
    () => persisted?.modes?.length ? persisted.modes : defaultModes,
  );
  const [connectors, setConnectors] = useState<Connector[]>(
    () =>
      persisted?.connectors?.length ? persisted.connectors : defaultConnectors,
  );
  const [designProfile, setDesignProfile] = useState<DesignProfile>(
    () => persisted?.designProfile ?? defaultDesignProfile,
  );
  const [activeModeId, setActiveModeId] = useState<string>(
    () => persisted?.activeModeId ?? defaultModes[0]?.id ?? "",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: PersistedState = {
      modes,
      connectors,
      designProfile,
      activeModeId,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("Failed to persist agentic studio state", error);
    }
  }, [activeModeId, connectors, designProfile, modes]);

  const activeMode = useMemo(
    () => modes.find((mode) => mode.id === activeModeId) ?? modes[0],
    [activeModeId, modes],
  );

  function handleCreateMode(mode: AssistantMode) {
    setModes((prev) => [...prev, mode]);
    setActiveModeId(mode.id);
  }

  function handleUpdateMode(mode: AssistantMode) {
    setModes((prev) => prev.map((item) => (item.id === mode.id ? mode : item)));
    if (mode.id === activeModeId) {
      setActiveModeId(mode.id);
    }
  }

  function handleCreateConnector(connector: Connector) {
    setConnectors((prev) => {
      const exists = prev.some((item) => item.id === connector.id);
      if (exists) {
        return prev.map((item) => (item.id === connector.id ? connector : item));
      }
      return [connector, ...prev];
    });
  }

  function handleUpdateConnector(connector: Connector) {
    setConnectors((prev) =>
      prev.map((item) => (item.id === connector.id ? connector : item)),
    );
  }

  return (
    <div
      className="min-h-screen w-full overflow-hidden text-white"
      style={{
        background: designProfile.backgroundGradient,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8 md:gap-10 md:px-8 md:py-12">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-white/60">
              Gemini Live · Agentic Studio
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
              Hyperwave voice console
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
              Orchestrate live voice interactions, evolve the visual system in
              real time, and slot in new MCP servers or APIs without leaving the
              studio. Designed for mobile-first deployment with a glassmorphism
              aesthetic.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-right text-xs uppercase tracking-[0.22em] text-white/60">
            <span>Active mode · {activeMode?.name ?? "None"}</span>
            <span>Connectors · {connectors.length}</span>
            <span>Design DNA · {designProfile.name}</span>
          </div>
        </header>

        <main className="grid flex-1 grid-cols-1 gap-6 pb-8 md:grid-cols-2 xl:grid-cols-3">
          {activeMode ? (
            <div className="md:col-span-2 xl:col-span-2">
              <VoiceAssistant
                activeMode={activeMode}
                modes={modes}
                connectors={connectors}
                designProfile={designProfile}
                onToggleMode={setActiveModeId}
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-6">
            <ModeStudio
              modes={modes}
              activeModeId={activeModeId}
              onSelectMode={setActiveModeId}
              onCreateMode={handleCreateMode}
              onUpdateMode={handleUpdateMode}
            />
            <IntegrationBoard
              connectors={connectors}
              onCreateConnector={handleCreateConnector}
              onUpdateConnector={handleUpdateConnector}
            />
          </div>
          <div className="md:col-span-2 xl:col-span-1">
            <DesignEvolutionPanel
              designProfile={designProfile}
              onUpdateDesign={setDesignProfile}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
