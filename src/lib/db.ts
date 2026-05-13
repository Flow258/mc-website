// ============================================================
// DATABASE CLIENT — Edge-compatible (Cloudflare Workers)
//
// @prisma/adapter-pg expects a pg-compatible Pool interface.
// @neondatabase/serverless exports exactly that interface but
// uses HTTP/WebSocket instead of raw TCP — so it works in
// Cloudflare Workers where pg's TCP sockets are blocked.
//
// Packages already in your package.json that this uses:
//   @prisma/adapter-pg        ← Prisma driver adapter
//   @neondatabase/serverless  ← drop-in pg Pool over HTTP/WS
//   (you can safely remove the "pg" package — it's not used here)
// ============================================================

import { PrismaPg }   from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";

// Local dev (Node.js) needs the 'ws' package for WebSockets.
// Cloudflare Workers have a native WebSocket API — skip it there.
if (typeof WebSocket === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require("ws");
}

function createEdgeClient(): PrismaClient {
  // Neon's Pool is a drop-in for pg.Pool — same interface,
  // routes connections over HTTP/WebSocket instead of TCP.
  const pool    = new Pool({ connectionString: process.env.DATABASE_URL! });
  const adapter = new PrismaPg(pool as any);
  return new PrismaClient({ adapter } as any);
}

// ── Singleton — reuse across hot-reloads in dev ───────────────
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createEdgeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;