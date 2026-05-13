// ============================================================
// SERVICE: MinecraftServerService
// Fetches and caches live Minecraft server status
// Uses the free mcsrvstat.us API (no key required)
// ============================================================

import { ServerStatus, RawServerStatusResponse } from "@/lib/models/ServerStatus";

interface CacheEntry {
  data: ServerStatus;
  expiresAt: number;
}

export class MinecraftServerService {
  private static readonly API_BASE = "https://api.mcsrvstat.us/3";
  private static readonly CACHE_TTL_MS = 30_000; // 30 seconds
  private static cache = new Map<string, CacheEntry>();

  private readonly host: string;
  private readonly port: number;

  constructor(host: string, port = 25565) {
    this.host = host;
    this.port = port;
  }

  private get cacheKey(): string {
    return `${this.host}:${this.port}`;
  }

  private get apiUrl(): string {
    return `${MinecraftServerService.API_BASE}/${this.cacheKey}`;
  }

  /** Fetch server status, respecting in-memory cache */
  async getStatus(): Promise<ServerStatus> {
    const cached = MinecraftServerService.cache.get(this.cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    const status = await this.fetchFresh();
    MinecraftServerService.cache.set(this.cacheKey, {
      data: status,
      expiresAt: Date.now() + MinecraftServerService.CACHE_TTL_MS,
    });

    return status;
  }

  /** Force a fresh fetch, bypassing cache */
  async fetchFresh(): Promise<ServerStatus> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8_000);

      // Next.js extends RequestInit with `next` for ISR/cache hints
      type NextFetchInit = RequestInit & { next?: { revalidate?: number } };
      const fetchOptions: NextFetchInit = {
        signal: controller.signal,
        next: { revalidate: 30 },
      };

      const res = await fetch(this.apiUrl, fetchOptions);

      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const raw: RawServerStatusResponse = await res.json();

      // mcsrvstat.us wraps the player list differently — normalize it
      const normalized: RawServerStatusResponse = {
        ...raw,
        players: raw.players
          ? {
              online: (raw.players as any).online ?? 0,
              max: (raw.players as any).max ?? 0,
              list: (raw.players as any).list?.map((p: any) =>
                typeof p === "string" ? p : p.name
              ) ?? [],
            }
          : undefined,
      };

      return new ServerStatus(normalized);
    } catch (err) {
      console.error(`[MinecraftServerService] Failed to fetch ${this.cacheKey}:`, err);
      return ServerStatus.offline(this.host, this.port);
    }
  }

  /** Clear the cache for this server (e.g. after admin action) */
  clearCache(): void {
    MinecraftServerService.cache.delete(this.cacheKey);
  }

  /** Static factory — create from env vars */
  static fromEnv(): MinecraftServerService {
    const host = process.env.MC_SERVER_HOST ?? "localhost";
    const port = parseInt(process.env.MC_SERVER_PORT ?? "25565", 10);
    return new MinecraftServerService(host, port);
  }
}
