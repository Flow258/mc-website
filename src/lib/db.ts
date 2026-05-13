// ============================================================
// DATABASE CLIENT
// Uses PrismaClient with optional edge adapter for Cloudflare
// ============================================================

import { PrismaClient } from "@prisma/client";

// For local development and production with standard Node.js,
// we use the regular Prisma client.
// The edge adapter (@prisma/adapter-pg) is only needed for
// Cloudflare Workers/Pages edge environments.

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    // Add logging in development to see queries
    ...(process.env.NODE_ENV === "development" && {
      log: [
        { level: "warn", emit: "stdout" },
        { level: "error", emit: "stdout" },
      ],
    }),
  });
}

// ── Singleton — reuse across hot-reloads in dev ───────────────
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;