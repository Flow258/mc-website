"use client";
// ============================================================
// COMPONENT: ServerStatusCard
// Live-polls /api/server-status every 30s via React hook
// ============================================================

import { useEffect, useState, useCallback } from "react";

interface ServerData {
  isOnline: boolean;
  address: string;
  players: { online: number; max: number; list: string[]; occupancyPercent: number };
  version: string;
  motdClean: string;
  latencyMs: number;
  fetchedAt: string;
}

// ── Custom hook encapsulates all polling logic ───────────────
function useServerStatus(pollIntervalMs = 30_000) {
  const [data, setData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch("/api/server-status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ServerData = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError("Could not reach the status API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, pollIntervalMs);
    return () => clearInterval(id);
  }, [fetch_, pollIntervalMs]);

  return { data, loading, error, refresh: fetch_ };
}

// ── Sub-component: player occupancy bar ──────────────────────
function OccupancyBar({ percent }: { percent: number }) {
  const color =
    percent >= 90 ? "bg-red-500" : percent >= 60 ? "bg-yellow-400" : "bg-emerald-400";

  return (
    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

// ── Sub-component: status dot (pulsing when online) ──────────
function StatusDot({ online }: { online: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {online && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      )}
      <span
        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
          online ? "bg-emerald-400" : "bg-red-500"
        }`}
      />
    </span>
  );
}

// ── Main component ────────────────────────────────────────────
export function ServerStatusCard() {
  const { data, loading, error } = useServerStatus();
  const [copied, setCopied] = useState(false);

  const copyIP = () => {
    if (!data?.address) return;
    navigator.clipboard.writeText(data.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
        <div className="h-8 bg-white/10 rounded w-2/3 mb-2" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300 text-sm">
        ⚠ {error ?? "Unknown error"}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusDot online={data.isOnline} />
          <span className={`text-sm font-medium ${data.isOnline ? "text-emerald-400" : "text-red-400"}`}>
            {data.isOnline ? "Online" : "Offline"}
          </span>
        </div>
        {data.latencyMs > 0 && (
          <span className="text-xs text-white/40">{data.latencyMs}ms</span>
        )}
      </div>

      {/* Server address + copy button */}
      <div>
        <p className="text-xs text-white/40 mb-1 uppercase tracking-widest">Server IP</p>
        <div className="flex items-center gap-3">
          <code className="text-xl font-bold tracking-tight text-white font-mono">
            {data.address}
          </code>
          <button
            onClick={copyIP}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors text-white/70"
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* MOTD */}
      {data.motdClean && (
        <p className="text-sm text-white/50 italic">{data.motdClean}</p>
      )}

      {/* Players */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Players</span>
          <span className="font-semibold text-white">
            {data.players.online}
            <span className="text-white/40"> / {data.players.max}</span>
          </span>
        </div>
        <OccupancyBar percent={data.players.occupancyPercent} />
      </div>

      {/* Online player list */}
      {data.players.list.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.players.list.slice(0, 8).map((name) => (
            <span
              key={name}
              className="px-2 py-0.5 rounded-md text-xs bg-white/10 text-white/70"
            >
              {name}
            </span>
          ))}
          {data.players.list.length > 8 && (
            <span className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-white/40">
              +{data.players.list.length - 8} more
            </span>
          )}
        </div>
      )}

      {/* Version */}
      <p className="text-xs text-white/30">
        {data.version} · Updated {new Date(data.fetchedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}
