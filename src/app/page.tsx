// ============================================================
// PAGE: Home "/"
// Hero with live server status + top 3 players preview
// Server Component — player data fetched at build/request time
// ============================================================

import { ServerStatusCard } from "@/components/ServerStatusCard";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerService } from "@/lib/services/PlayerService";
import Link from "next/link";

export const revalidate = 60; // ISR — revalidate every 60 seconds

async function getTopPlayers() {
  try {
    const service = PlayerService.create();
    return await service.getLeaderboard("playtimeMinutes", 3);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const topPlayers = await getTopPlayers();

  return (
    <div className="bg-grid min-h-screen">
      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: text */}
        <div className="space-y-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Survival · Semi-Vanilla
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-none tracking-tight">
            Black
            <br />
            <span className="text-emerald-400">Archive</span>
            <br />
            <span className="text-white/30 text-3xl font-medium">SMP</span>
          </h1>

          <p className="text-white/50 text-lg max-w-md leading-relaxed">
            A community-driven Minecraft survival server. Build, explore, and
            compete with friends in a persistent world.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/players"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-colors font-semibold text-white"
            >
              View Leaderboard
            </Link>
            <a
              href="https://discord.gg/yourserver"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border border-white/15 hover:bg-white/10 transition-colors font-semibold text-white/70"
            >
              Join Discord
            </a>
          </div>
        </div>

        {/* Right: live server status */}
        <div className="animate-fade-up delay-200">
          <ServerStatusCard />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: "⚔️", title: "PvP Arenas",  desc: "Weekly tournaments with custom prizes" },
            { icon: "🗺️", title: "Live Map",    desc: "Real-time Dynmap of the entire world"  },
            { icon: "🏆", title: "Leaderboards", desc: "Compete for top kills, playtime & more" },
          ].map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className={`rounded-2xl border border-white/10 bg-white/5 p-6 card-glow animate-fade-up delay-${(i + 1) * 100}`}
            >
              <span className="text-3xl">{icon}</span>
              <h3 className="font-bold text-white mt-3">{title}</h3>
              <p className="text-sm text-white/50 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOP PLAYERS PREVIEW ── */}
      {topPlayers.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">🏆 Top Players</h2>
            <Link
              href="/players"
              className="text-sm text-white/40 hover:text-white transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-3">
            {topPlayers.map((player, i) => (
              <PlayerCard
                key={player.id}
                rank={i + 1}
                displayName={player.displayName}
                discordUsername={player.discordUsername}
                minecraft={
                  player.isLinked
                    ? { uuid: player.minecraftUuid, username: player.minecraftUsername }
                    : null
                }
                stats={{
                  playtimeFormatted: player.playtimeFormatted,
                  kills: player.kills,
                  deaths: player.deaths,
                  kdr: player.kdr,
                }}
                role={player.role}
                roleBadge={player.roleBadge}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
