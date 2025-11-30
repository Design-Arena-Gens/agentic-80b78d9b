'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AssistantMode,
  ChatMessage,
  Connector,
  DesignProfile,
} from "@/types";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { blobToBase64 } from "@/lib/audio";

interface VoiceAssistantProps {
  activeMode: AssistantMode;
  modes: AssistantMode[];
  connectors: Connector[];
  designProfile: DesignProfile;
  onToggleMode: (modeId: string) => void;
}

type AssistantStatus = "idle" | "recording" | "processing" | "error";

const createMessageId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID()) ||
  `msg-${Math.random().toString(36).slice(2, 9)}`;

function inferConnectorSummary(connectors: Connector[]): string {
  const active = connectors.filter((c) => c.status === "active");
  if (active.length === 0) {
    return "No live connectors. Provide guidance from core knowledge.";
  }
  const summaryLines = active.map(
    (connector) =>
      `${connector.name} (${connector.type}) → ${connector.capabilities
        .slice(0, 3)
        .join(", ")}`,
  );
  return `Active graph: ${summaryLines.join(" · ")}`;
}

export function VoiceAssistant({
  activeMode,
  modes,
  connectors,
  designProfile,
  onToggleMode,
}: VoiceAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<AssistantStatus>("idle");
  const [input, setInput] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const hasSpeechSynthesis =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const { isRecording, permissionError, startRecording, stopRecording } =
    useAudioRecorder();

  const connectorSummary = useMemo(
    () => inferConnectorSummary(connectors),
    [connectors],
  );

  useEffect(() => {
    if (permissionError) {
      setStatus("error");
      setErrorMessage(permissionError);
    }
  }, [permissionError]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const opener =
      activeMode.defaultOpeners[
        Math.floor(Math.random() * activeMode.defaultOpeners.length)
      ] ?? "How can I assist?";
    setMessages([
      {
        id: createMessageId(),
        role: "assistant",
        text: opener,
        modeId: activeMode.id,
        createdAt: Date.now(),
      },
    ]);
  }, [activeMode]);

  async function handleStopRecording() {
    try {
      setStatus("processing");
      const blob = await stopRecording();
      if (!blob || blob.size === 0) {
        setStatus("idle");
        return;
      }

      const base64 = await blobToBase64(blob);
      await transmitInteraction({ audioBase64: base64 });
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Recording failed.",
      );
    }
  }

  async function transmitInteraction(payload: {
    audioBase64?: string;
    prompt?: string;
  }) {
    const userText = payload.prompt?.trim() ?? "";

    const nextMessages = [...messages];
    if (payload.audioBase64 || userText) {
      const descriptor = [
        activeMode.name,
        activeMode.tone,
        payload.audioBase64 ? "voice capture" : undefined,
      ]
        .filter(Boolean)
        .join(" • ");

      nextMessages.push({
        id: createMessageId(),
        role: "user",
        text: userText || `[Sent ${descriptor}]`,
        modeId: activeMode.id,
        createdAt: Date.now(),
      });
    }

    setMessages(nextMessages);
    setStatus("processing");
    setErrorMessage(null);

    const historyPayload = nextMessages
      .slice(-12)
      .map(({ role, text, modeId }) => ({
        role,
        text,
        modeId,
      }));

    try {
      const response = await fetch("/api/gemini/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modeId: activeMode.id,
          audioBase64: payload.audioBase64,
          prompt: userText,
          history: historyPayload,
          connectors,
          designProfile,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(
          errorPayload?.error ??
            `Gemini request failed with status ${response.status}`,
        );
      }

      const result = await response.json();
      const assistantText =
        typeof result.text === "string" && result.text.trim().length > 0
          ? result.text.trim()
          : "I generated a response but could not parse the content.";

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        text: assistantText,
        modeId: activeMode.id,
        createdAt: Date.now(),
        connectorContext: result.connectorContext ?? [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStatus("idle");

      if (autoSpeak && hasSpeechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(assistantText);
        utterance.rate = 1.05;
        utterance.pitch = 1.08;
        utterance.lang = "en-US";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      setStatus("error");
      const message =
        error instanceof Error ? error.message : "Unexpected response failure.";
      setErrorMessage(message);
    } finally {
      setInput("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) return;
    await transmitInteraction({ prompt: input });
  }

  return (
    <section
      className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-5 shadow-[0_40px_120px_-60px_rgba(5,219,255,0.45)] backdrop-blur-xl md:p-8"
      style={{
        boxShadow: `0 24px 120px -60px ${designProfile.accentColor}aa`,
      }}
    >
      <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/70">
            Live Voice Assistant
          </p>
          <h2 className="text-2xl font-semibold text-white md:text-3xl">
            {activeMode.name}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
            {activeMode.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
            {status === "recording" ? "Listening…" : "Ready"}
          </div>
          <label className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={(event) => setAutoSpeak(event.target.checked)}
              className="accent-white"
            />
            Auto voice playback
          </label>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onToggleMode(mode.id)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              mode.id === activeMode.id
                ? "bg-white text-black"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            {mode.name}
          </button>
        ))}
      </div>

      <div
        ref={viewportRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl bg-white/[0.04] p-4 pr-2"
      >
        {messages.map((message) => (
          <article
            key={message.id}
            className={`flex w-full gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-[0_18px_40px_-24px_rgba(0,0,0,0.4)] ${
                message.role === "user"
                  ? "bg-white text-black"
                  : "bg-white/[0.08] text-white"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
              {message.connectorContext?.length ? (
                <div className="mt-3 space-y-1 text-[11px] uppercase tracking-[0.3em] text-white/40">
                  {message.connectorContext.map((context) => (
                    <p key={context}>{context}</p>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <footer className="mt-4 space-y-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">
            Mode orchestration
          </p>
          <p className="mt-2 text-sm text-white/80">{connectorSummary}</p>
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/20 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isRecording) {
                void handleStopRecording();
              } else {
                setStatus("recording");
                void startRecording();
              }
            }}
            className="relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-2xl bg-white/15 text-sm font-medium text-white transition hover:bg-white/20 md:h-14 md:flex-none md:px-10"
            style={{
              background:
                status === "recording"
                  ? `linear-gradient(135deg, ${activeMode.waveformColor}55, ${designProfile.accentColor}55)`
                  : undefined,
            }}
          >
            <div
              className={`absolute inset-0 transition-opacity ${
                status === "recording" ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute inset-0 animate-pulse bg-red-500/20" />
            </div>
            <span className="relative z-10">
              {isRecording ? "Tap to stop" : "Tap to speak"}
            </span>
          </button>

          <form onSubmit={handleSubmit} className="flex flex-1 gap-3 md:flex-[2]">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type or paste context for Gemini..."
              className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none ring-0 placeholder:text-white/40"
            />
            <button
              type="submit"
              className="flex items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Send
            </button>
          </form>
        </div>
      </footer>
    </section>
  );
}
