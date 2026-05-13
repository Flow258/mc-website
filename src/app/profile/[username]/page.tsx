// ============================================================
// PAGE: /profile/[username]
// Public player profile — Server Component
// Avatar uses MCBodyAvatar (Client Component) so onError
// fallback fires in the browser, not during SSR.
// ============================================================

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PlayerService } from "@/lib/services/PlayerService";
import { MCBodyAvatar } from "@/components/MCAvatar";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${decodeURIComponent(username)}'s Profile`,
  };
}

// ── Stat block sub-component ──────────────────────────────────
function StatBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-emerald-400 font-medium">{sub}</p>}
      <p className="text-xs text-white/40 mt-1">{label}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default async function ProfilePage({ params }: Props) {
  const { username: encodedUsername } = await params;
  const username = decodeURIComponent(encodedUsername);
  const service = PlayerService.create();

  const player = await service.getByMinecraftUsername(username);
  if (!player) notFound();

  const joinDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(player.joinedAt);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-up">
      {/* ── Profile header ── */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-6 flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        {/* Body render — MCBodyAvatar is a Client Component so onError works */}
        <div className="relative flex-shrink-0">
          {player.isLinked ? (
            <MCBodyAvatar
              uuid={player.minecraftUuid}
              username={player.minecraftUsername}
              height={160}
              className="drop-shadow-2xl"
            />
          ) : (
            <div className="w-16 h-32 rounded-xl bg-white/10 flex items-center justify-center text-4xl">
              👤
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div>
            <h1 className="text-4xl font-black text-white">{player.displayName}</h1>
            <p className="text-white/40 text-sm mt-0.5">
              Discord: {player.discordUsername}
            </p>
          </div>

          {/* Role badge */}
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${
              player.role === "OWNER"
                ? "border-red-500/40 bg-red-500/15 text-red-400"
                : player.role === "ADMIN"
                ? "border-blue-500/40 bg-blue-500/15 text-blue-400"
                : player.role === "VIP"
                ? "border-yellow-500/40 bg-yellow-500/15 text-yellow-400"
                : "border-white/10 bg-white/5 text-white/40"
            }`}
          >
            {player.roleBadge}
          </span>

          {/* Minecraft link status */}
          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm">
            {player.isLinked ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-white/60">
                  Minecraft linked
                  {player.linkedAt && (
                    <span className="text-white/30 ml-1">
                      ·{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        year: "numeric",
                      }).format(player.linkedAt)}
                    </span>
                  )}
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-white/20" />
                <span className="text-white/30">Minecraft not linked</span>
              </>
            )}
          </div>

          <p className="text-xs text-white/30">Member since {joinDate}</p>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <h2 className="text-lg font-bold text-white mb-4">📊 Statistics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatBlock label="Playtime" value={player.playtimeFormatted} />
        <StatBlock label="Kills" value={player.kills} />
        <StatBlock label="Deaths" value={player.deaths} />
        <StatBlock
          label="K/D Ratio"
          value={player.kdr}
          sub={
            player.kdr >= 2
              ? "💪 Impressive"
              : player.kdr >= 1
              ? "👍 Positive"
              : "📈 Improving"
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatBlock
          label="Blocks Placed"
          value={player.blocksPlaced.toLocaleString()}
        />
        <StatBlock
          label="Blocks Broken"
          value={player.blocksBroken.toLocaleString()}
        />
      </div>
    </div>
  );
}