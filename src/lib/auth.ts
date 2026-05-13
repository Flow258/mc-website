// ============================================================
// AUTH CONFIG
// NextAuth v5 (Auth.js) with Discord OAuth
// Automatically upserts player record on every sign-in
// ============================================================

import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { PlayerService } from "@/lib/services/PlayerService";

const playerService = PlayerService.create();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          // "guilds" removed — requires extra user approval and is not needed
          // for basic auth. Add it back only if you need guild membership checks.
          scope: "identify email",
        },
      },
    }),
  ],

  callbacks: {
    // ── Called after successful OAuth ─────────────────────
    async signIn({ user, account, profile }) {
      if (account?.provider !== "discord" || !profile?.id) return false;

      try {
        await playerService.upsertFromDiscord({
          id:       profile.id,
          username: profile.username ?? user.name ?? "Unknown",
          avatar:   user.image ?? null,
        });
        return true;
      } catch (err) {
        console.error("[Auth] signIn upsert failed:", err);
        return false;
      }
    },

    // ── Enrich JWT with Discord ID + DB role ─────────────
    async jwt({ token, account, profile }) {
      if (account?.provider === "discord" && profile?.id) {
        token.discordId = profile.id;
        try {
          const player = await playerService.getByDiscordId(profile.id);
          token.role     = player?.role     ?? "MEMBER";
          token.isLinked = player?.isLinked ?? false;
        } catch {
          token.role     = "MEMBER";
          token.isLinked = false;
        }
      }
      return token;
    },

    // ── Expose discordId + role to client session ─────────
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          discordId: token.discordId ?? "",
          role:      (token.role ?? "MEMBER") as "MEMBER" | "VIP" | "ADMIN" | "OWNER",
          isLinked:  token.isLinked ?? false,
        },
      };
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});
