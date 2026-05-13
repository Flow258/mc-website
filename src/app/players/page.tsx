"use client";
// ============================================================
// PAGE: /players — Full Leaderboard
// Client component so tab-switching is instant (no page reload)
// ============================================================

import { useEffect, useState } from "react";
import { PlayerCard } from "@/components/PlayerCard";

type SortField = "playtimeMinutes" | "kills" | "kdr" | "blocksPlaced";

interface PlayerJSON {
  id: string;
  displayName: string;
  discordUsername: string;
  minecraft: { uuid: string | null; username: string | null } | null;
  stats: {
    playtimeFormatted: string;
    kills: number;
    deaths: number;
    kdr: number;
    blocksPlaced: number;
  };
  role: string;
  roleBadge: string;
}

const TABS: { field: SortField; label: string; icon: string }[] = [
  { field: "playtimeMinutes", label: "Playtime", icon: "⏱" },
  { field: "kills",           label: "Kills",    icon: "⚔️" },
  { field: "kdr",             label: "K/D Ratio", icon: "💀" },
  { field: "blocksPlaced",    label: "Builder",  icon: "🧱" },
];

// ── Custom hook: fetch leaderboard on sort change ─────────────
function useLeaderboard(sort: SortField) {
  const [players, setPlayers] = useState<PlayerJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/players?sort=${sort}&limit=25`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => { if (!cancelled) { setPlayers(data.players); setLoading(false); } })
      .catch((e)  => { if (!cancelled) { setError(e.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [sort]);

  return { players, loading, error };
}

// ── Skeleton rows while loading ───────────────────────────────
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-xl bg-white/5 animate-pulse"
          style={{ animationDelay: `${i * 50}ms` }}
        />
      ))}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function PlayersPage() {
  const [sort, setSort] = useState<SortField>("playtimeMinutes");
  const { players, loading, error } = useLeaderboard(sort);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <h1 className="text-4xl font-black text-white">🏆 Leaderboard</h1>
        <p className="text-white/40 mt-1">Top players across all categories</p>
      </div>

      {/* Sort tabs */}
      <div className="flex flex-wrap gap-2 mb-8 animate-fade-up delay-100">
        {TABS.map(({ field, label, icon }) => (
          <button
            key={field}
            onClick={() => setSort(field)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              sort === field
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm mb-6">
          ⚠ Failed to load leaderboard: {error}
        </div>
      )}

      {/* Player list */}
      <div className="space-y-3 animate-fade-up delay-200">
        {loading ? (
          <SkeletonRows />
        ) : players.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <p className="text-4xl mb-3">👻</p>
            <p>No players yet. Be the first to join!</p>
          </div>
        ) : (
          players.map((p, i) => (
            <PlayerCard
              key={p.id}
              rank={i + 1}
              displayName={p.displayName}
              discordUsername={p.discordUsername}
              minecraft={p.minecraft}
              stats={p.stats}
              role={p.role}
              roleBadge={p.roleBadge}
            />
          ))
        )}
      </div>
    </div>
  );
}
