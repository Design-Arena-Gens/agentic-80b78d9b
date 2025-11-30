'use client';

import { useState } from "react";
import type { Connector } from "@/types";

interface IntegrationBoardProps {
  connectors: Connector[];
  onUpdateConnector: (connector: Connector) => void;
  onCreateConnector: (connector: Connector) => void;
}

const defaultForm: Connector = {
  id: "",
  name: "",
  type: "mcp",
  endpoint: "",
  status: "draft",
  description: "",
  capabilities: [],
  lastSync: "now",
};

export function IntegrationBoard({
  connectors,
  onCreateConnector,
  onUpdateConnector,
}: IntegrationBoardProps) {
  const [isComposerVisible, setIsComposerVisible] = useState(false);
  const [formState, setFormState] = useState<Connector>(defaultForm);

  function openComposer() {
    setFormState({ ...defaultForm, id: generateConnectorId() });
    setIsComposerVisible(true);
  }

  function closeComposer() {
    setIsComposerVisible(false);
    setFormState(defaultForm);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formState.id) {
      setFormState((current) => ({
        ...current,
        id: generateConnectorId(),
      }));
    }

    const payload = {
      ...formState,
      capabilities: splitTokens(formState.capabilities.join(",")),
    };

    onCreateConnector(payload);
    closeComposer();
  }

  function toggleStatus(connector: Connector) {
    const nextStatus =
      connector.status === "active"
        ? "paused"
        : connector.status === "paused"
          ? "draft"
          : "active";
    onUpdateConnector({ ...connector, status: nextStatus, lastSync: "now" });
  }

  return (
    <section className="flex h-full flex-col gap-4 rounded-3xl border border-white/8 bg-black/60 p-6 text-white backdrop-blur-xl">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Integrations
          </p>
          <h2 className="text-xl font-semibold md:text-2xl">
            Connector graph
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Track MCP servers, APIs, and data lakes. Toggle activation states to
            steer the assistant&apos;s knowledge terrain.
          </p>
        </div>
        <button
          type="button"
          onClick={openComposer}
          className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-white/90"
        >
          Add connector
        </button>
      </header>

      <div className="space-y-4">
        {connectors.map((connector) => (
          <article
            key={connector.id}
            className="rounded-3xl border border-white/10 bg-white/[0.05] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  {connector.type.toUpperCase()}
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  {connector.name}
                </h3>
                <p className="mt-1 text-sm text-white/70">
                  {connector.description}
                </p>
                <p className="mt-2 text-xs text-white/40">
                  Endpoint · {connector.endpoint}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleStatus(connector)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  connector.status === "active"
                    ? "bg-emerald-400 text-black"
                    : connector.status === "paused"
                      ? "bg-amber-400 text-black"
                      : "bg-white/20 text-white"
                }`}
              >
                {connector.status}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {connector.capabilities.map((capability) => (
                <span
                  key={capability}
                  className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/60"
                >
                  {capability}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-white/40">
              Last sync: {connector.lastSync}
            </p>
          </article>
        ))}
      </div>

      {isComposerVisible ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/80 p-6">
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-xl flex-col gap-4 rounded-3xl border border-white/10 bg-black/90 p-6 text-white backdrop-blur-xl"
          >
            <h3 className="text-xl font-semibold uppercase tracking-[0.24em]">
              New connector
            </h3>

            <label className="flex flex-col gap-2 text-sm text-white/70">
              Title
              <input
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-white outline-none"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-white/70">
              Endpoint / identifier
              <input
                value={formState.endpoint}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    endpoint: event.target.value,
                  }))
                }
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-white outline-none"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-white/70">
              Connector type
              <select
                value={formState.type}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    type: event.target.value as Connector["type"],
                  }))
                }
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-white outline-none"
              >
                <option value="mcp">MCP Server</option>
                <option value="api">External API</option>
                <option value="datasource">Data Source</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-white/70">
              Description
              <textarea
                value={formState.description}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="min-h-[80px] rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-white/70">
              Capabilities (comma separated)
              <input
                value={formState.capabilities.join(", ")}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    capabilities: splitTokens(event.target.value),
                  }))
                }
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-white outline-none"
              />
            </label>

            <div className="flex items-center justify-end gap-3 pt-3">
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
                Create
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function generateConnectorId() {
  return `conn-${Math.random().toString(36).slice(2, 10)}`;
}

function splitTokens(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
