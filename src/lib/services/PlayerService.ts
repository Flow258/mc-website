// ============================================================
// SERVICE: PlayerService
// Handles all player database operations via Prisma
// ============================================================

import { db } from "@/lib/db";
import { Player, RawPlayerRow } from "@/lib/models/Player";

/** Generate a random hex string using Web Crypto API (Cloudflare compatible) */
function generateRandomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  if (typeof window !== "undefined" && window.crypto) {
    // Browser environment
    crypto.getRandomValues(arr);
  } else {
    // Node.js environment
    const { randomBytes } = require("crypto");
    const buf = randomBytes(bytes);
    for (let i = 0; i < bytes; i++) arr[i] = buf[i];
  }
  return Array.from(arr).map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export type LeaderboardField = "playtimeMinutes" | "kills" | "kdr" | "blocksPlaced";

export class PlayerService {
  // ──────────────────────────────────────────────
  // QUERIES
  // ──────────────────────────────────────────────

  /** Fetch a single player by Discord ID */
  async getByDiscordId(discordId: string): Promise<Player | null> {
    const row = await db.player.findUnique({ where: { discordId } });
    return row ? new Player(row as RawPlayerRow) : null;
  }

  /** Fetch a single player by Minecraft username (case-insensitive) */
  async getByMinecraftUsername(username: string): Promise<Player | null> {
    const row = await db.player.findFirst({
      where: { minecraftUsername: { equals: username, mode: "insensitive" } },
    });
    return row ? new Player(row as RawPlayerRow) : null;
  }

  /** Get top N players sorted by a stat field */
  async getLeaderboard(field: LeaderboardField, limit = 10): Promise<Player[]> {
    const baseWhere = { minecraftUsername: { not: null } };

    // Use static queries (not dynamic orderBy) to avoid Cloudflare Workers eval() error
    switch (field) {
      case "playtimeMinutes":
        {
          const rows = await db.player.findMany({
            where: baseWhere,
            orderBy: { playtimeMinutes: "desc" },
            take: limit,
          });
          return rows.map((r) => new Player(r as RawPlayerRow));
        }

      case "kills":
        {
          const rows = await db.player.findMany({
            where: baseWhere,
            orderBy: { kills: "desc" },
            take: limit,
          });
          return rows.map((r) => new Player(r as RawPlayerRow));
        }

      case "blocksPlaced":
        {
          const rows = await db.player.findMany({
            where: baseWhere,
            orderBy: { blocksPlaced: "desc" },
            take: limit,
          });
          return rows.map((r) => new Player(r as RawPlayerRow));
        }

      case "kdr":
      default:
        // KDR is computed, not stored — calculate in app layer
        {
          const rows = await db.player.findMany({
            where: baseWhere,
            orderBy: { kills: "desc" },
            take: 50, // fetch more, sort in memory
          });
          return rows
            .map((r) => new Player(r as RawPlayerRow))
            .sort((a, b) => b.kdr - a.kdr)
            .slice(0, limit);
        }
    }
  }

  /** Get all players (for admin views) */
  async getAll(page = 1, perPage = 20): Promise<{ players: Player[]; total: number }> {
    const [rows, total] = await Promise.all([
      db.player.findMany({
        orderBy: { joinedAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      db.player.count(),
    ]);

    return {
      players: rows.map((r) => new Player(r as RawPlayerRow)),
      total,
    };
  }

  // ──────────────────────────────────────────────
  // MUTATIONS
  // ──────────────────────────────────────────────

  /** Upsert a player record when they log in via Discord OAuth */
  async upsertFromDiscord(discord: {
    id: string;
    username: string;
    avatar: string | null;
  }): Promise<Player> {
    const row = await db.player.upsert({
      where: { discordId: discord.id },
      create: {
        discordId: discord.id,
        discordUsername: discord.username,
        discordAvatar: discord.avatar,
      },
      update: {
        discordUsername: discord.username,
        discordAvatar: discord.avatar,
      },
    });
    return new Player(row as RawPlayerRow);
  }

  /** Generate a one-time link code for in-game verification */
  async generateLinkCode(discordId: string): Promise<string> {
    const code = generateRandomHex(3); // e.g. "A3F9B1"
    await db.linkCode.upsert({
      where: { discordId },
      create: { discordId, code, expiresAt: new Date(Date.now() + 10 * 60_000) },
      update: { code, expiresAt: new Date(Date.now() + 10 * 60_000) },
    });
    return code;
  }

  /** Confirm Minecraft link when player runs /link CODE in-game */
  async confirmLink(
    code: string,
    minecraftUuid: string,
    minecraftUsername: string
  ): Promise<Player | null> {
    const linkCode = await db.linkCode.findFirst({
      where: { code, expiresAt: { gt: new Date() } },
    });
    if (!linkCode) return null;

    // Use the callback form of $transaction so TypeScript infers return
    // types correctly — avoids the unsafe `const [row] = ...` destructure.
    const row = await db.$transaction(async (tx) => {
      const updated = await tx.player.update({
        where: { discordId: linkCode.discordId },
        data:  { minecraftUuid, minecraftUsername, linkedAt: new Date() },
      });
      await tx.linkCode.delete({ where: { discordId: linkCode.discordId } });
      return updated;
    });

    return new Player(row as RawPlayerRow);
  }

  /** Update player stats (called by your Minecraft plugin or webhook) */
  async updateStats(
    minecraftUuid: string,
    delta: Partial<Pick<RawPlayerRow, "playtimeMinutes" | "kills" | "deaths" | "blocksPlaced" | "blocksBroken">>
  ): Promise<void> {
    await db.player.updateMany({
      where: { minecraftUuid },
      data: delta,
    });
  }

  /** Static factory */
  static create(): PlayerService {
    return new PlayerService();
  }
}
