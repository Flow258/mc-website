// ============================================================
// PAGE: /profile  (My Profile — requires login)
// Shows the logged-in user's own stats + link account widget
// ============================================================

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PlayerService } from "@/lib/services/PlayerService";
import { MCBodyAvatar } from "@/components/MCAvatar";
import { LinkAccountCard } from "@/components/LinkAccountCard";
import Link from "next/link";

export const metadata = { title: "My Profile" };

export default async function MyProfilePage() {
  const session = await auth();
  if (!session?.user?.discordId) redirect("/login");

  const service = PlayerService.create();
  const player = await service.getByDiscordId(session.user.discordId);

  if (!player) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 animate-fade-up">
      <h1 className="text-3xl font-black text-white">My Profile</h1>

      {/* Profile card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        {/* Avatar — MCBodyAvatar is a Client Component so onError works */}
        <div>
          {player.isLinked ? (
            <MCBodyAvatar
              uuid={player.minecraftUuid}
              username={player.minecraftUsername}
              height={120}
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-4xl">
              {session.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  width={80}
                  height={80}
                  className="rounded-2xl"
                />
              ) : "👤"}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-black text-white">{player.displayName}</h2>
          <p className="text-white/40 text-sm">Discord: {player.discordUsername}</p>
          <span className={`inline-block text-xs px-2 py-1 rounded-full border ${
            player.role === "OWNER" ? "border-red-500/40 bg-red-500/15 text-red-400" :
            player.role === "ADMIN" ? "border-blue-500/40 bg-blue-500/15 text-blue-400" :
            player.role === "VIP"   ? "border-yellow-500/40 bg-yellow-500/15 text-yellow-400" :
                                      "border-white/10 bg-white/5 text-white/40"
          }`}>
            {player.roleBadge}
          </span>

          {player.isLinked && (
            <div className="pt-2">
              <Link
                href={`/profile/${player.minecraftUsername}`}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View public profile →
              </Link>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 text-center">
          {[
            { label: "Playtime", val: player.playtimeFormatted },
            { label: "K/D",      val: player.kdr              },
            { label: "Kills",    val: player.kills             },
            { label: "Deaths",   val: player.deaths            },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3">
              <p className="text-lg font-black text-white">{val}</p>
              <p className="text-xs text-white/40">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Link account widget (only if not yet linked) */}
      {!player.isLinked && <LinkAccountCard />}

      {/* Already linked info */}
      {player.isLinked && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <h3 className="font-bold text-emerald-400 mb-2">✅ Minecraft Linked</h3>
          <p className="text-white/60 text-sm">
            Your account is linked to{" "}
            <span className="text-white font-semibold font-mono">
              {player.minecraftUsername}
            </span>
            . Your stats update automatically as you play.
          </p>
        </div>
      )}
    </div>
  );
}
