// ============================================================
// DATABASE CLIENT
// Uses PrismaClient with optional edge adapter for Cloudflare
// Standard client for Vercel, Node.js, and traditional hosting
// ============================================================

import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  // Detect if we're in an edge runtime (Cloudflare Workers)
  const isCloudflareWorkers =
    typeof globalThis !== "undefined" &&
    (globalThis.caches !== undefined || // Cloudflare Workers have caches API
      process.env.ENVIRONMENT === "cloudflare" ||
      process.env.RUNTIME === "edge");

  if (isCloudflareWorkers) {
    // Cloudflare Workers environment — use edge adapter
    try {
      const { PrismaPg } = require("@prisma/adapter-pg");
      return new PrismaClient({
        adapter: new PrismaPg({
          datasourceUrl: process.env.DATABASE_URL,
        }),
      });
    } catch (err) {
      console.warn(
        "[Prisma] Failed to load edge adapter, falling back to standard client"
      );
    }
  }

  // Standard Node.js environment:
  // - Vercel
  // - Local development
  // - Traditional Node.js hosting
  return new PrismaClient({
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