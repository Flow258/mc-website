// ============================================================
// DB SEED — prisma/seed.ts
// Populates dev database with fake players
// Run: npm run db:seed
// ============================================================

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const FAKE_PLAYERS = [
  {
    discordId: "111111111111111111",
    discordUsername: "SteveBuilder",
    minecraftUuid:     "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    minecraftUsername: "Notch",
    role:              "OWNER" as const,
    playtimeMinutes:   14400,
    kills: 312, deaths:  45, blocksPlaced: 128_000, blocksBroken: 98_000,
  },
  {
    discordId: "222222222222222222",
    discordUsername: "DiamondMiner99",
    minecraftUuid:     "853c80ef-3c37-49fd-aa49-938b674adae6",
    minecraftUsername: "jeb_",
    role:              "ADMIN" as const,
    playtimeMinutes:   8820,
    kills: 205, deaths:  88, blocksPlaced:  65_000, blocksBroken: 72_000,
  },
  {
    discordId: "333333333333333333",
    discordUsername: "CreeperHunter",
    minecraftUuid:     "f498513c-e8c8-4173-9df6-8e9fd4b02bb6",
    minecraftUsername: "Dinnerbone",
    role:              "VIP" as const,
    playtimeMinutes:   5040,
    kills: 444, deaths: 120, blocksPlaced:  12_000, blocksBroken: 18_000,
  },
  {
    discordId: "444444444444444444",
    discordUsername: "LavaWalker",
    minecraftUuid:     null,
    minecraftUsername: null,
    role:              "MEMBER" as const,
    playtimeMinutes:   2160,
    kills:  88, deaths:  99, blocksPlaced:   8_000, blocksBroken:  5_000,
  },
  {
    discordId: "555555555555555555",
    discordUsername: "NightCrawler",
    minecraftUuid:     "7125ba8b-1c86-4508-b92d-b5c3d6086d4d",
    minecraftUsername: "Grumm",
    role:              "MEMBER" as const,
    playtimeMinutes:   3300,
    kills: 150, deaths:  62, blocksPlaced:  22_000, blocksBroken: 31_000,
  },
];

async function main() {
  console.log("🌱 Seeding database…");

  for (const p of FAKE_PLAYERS) {
    await db.player.upsert({
      where: { discordId: p.discordId },
      create: {
        ...p,
        linkedAt: p.minecraftUuid ? new Date("2024-01-15") : null,
        joinedAt: new Date("2024-01-01"),
      },
      update: p,
    });
    console.log(`  ✓ ${p.discordUsername}`);
  }

  console.log("✅ Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
