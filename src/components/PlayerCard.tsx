"use client";
// ============================================================
// COMPONENT: PlayerCard
// Renders a player summary with Minecraft avatar
// ============================================================

import { AvatarService } from "@/lib/services/AvatarService";
import Link from "next/link";

interface PlayerCardProps {
  rank?: number;
  displayName: string;
  discordUsername: string;
  minecraft: { uuid: string | null; username: string | null } | null;
  stats: {
    playtimeFormatted: string;
    kills: number;
    deaths: number;
    kdr: number;
  };
  role: string;
  roleBadge: string;
}

// ── Avatar sub-component with fallback ───────────────────────
function MCAvatar({
  uuid,
  username,
}: {
  uuid: string | null;
  username: string | null;
}) {
  const { primary, fallback } = AvatarService.getSmartUrls(uuid, username, "head", 64);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={primary}
      alt={username ?? "Player"}
      width={48}
      height={48}
      onError={(e) => {
        (e.target as HTMLImageElement).src = fallback;
      }}
      className="rounded-lg pixelated"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// ── Stat pill ─────────────────────────────────────────────────
function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

// ── Rank medal colors ─────────────────────────────────────────
const RANK_COLORS: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-slate-300",
  3: "text-amber-600",
};

// ── Main component ────────────────────────────────────────────
export function PlayerCard({
  rank,
  displayName,
  discordUsername,
  minecraft,
  stats,
  role,
  roleBadge,
}: PlayerCardProps) {
  const rankColor = rank ? (RANK_COLORS[rank] ?? "text-white/30") : null;

  return (
    <Link
      href={`/profile/${displayName}`}
      className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all p-4"
    >
      {/* Rank number */}
      {rank && (
        <span className={`text-xl font-black w-7 text-center ${rankColor}`}>
          {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
        </span>
      )}

      {/* Avatar */}
      {minecraft ? (
        <MCAvatar uuid={minecraft.uuid} username={minecraft.username} />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-xl">
          ?
        </div>
      )}

      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{displayName}</p>
        <p className="text-xs text-white/40 truncate">{discordUsername}</p>
        <span
          className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded bg-white/10 ${
            role === "OWNER"
              ? "text-red-400"
              : role === "ADMIN"
              ? "text-blue-400"
              : role === "VIP"
              ? "text-yellow-400"
              : "text-white/40"
          }`}
        >
          {roleBadge}
        </span>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex gap-5 mr-2">
        <StatPill label="Playtime" value={stats.playtimeFormatted} />
        <StatPill label="K/D" value={stats.kdr} />
        <StatPill label="Kills" value={stats.kills} />
      </div>

      {/* Arrow */}
      <span className="text-white/20 group-hover:text-white/60 transition-colors">›</span>
    </Link>
  );
}
