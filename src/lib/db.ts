// ============================================================
// DATABASE CLIENT
// Uses PrismaClient with optional edge adapter for Cloudflare
// ============================================================

import { PrismaClient } from "@prisma/client";

// For Cloudflare Workers/Pages, use the edge adapter
// For local development and Node.js production, use standard client

function createPrismaClient() {
  // Detect if we're in an edge runtime (Cloudflare Workers)
  // Check for Cloudflare-specific globals
  const isEdgeRuntime =
    typeof globalThis !== "undefined" &&
    (globalThis.caches !== undefined || // Cloudflare Workers have caches API
      process.env.ENVIRONMENT === "cloudflare" ||
      process.env.RUNTIME === "edge");

  if (isEdgeRuntime) {
    // Cloudflare Workers environment
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
      // Fall back to standard client if edge adapter fails
    }
  }

  // Standard Node.js environment (local dev, traditional hosting)
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