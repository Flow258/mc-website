// ============================================================
// SERVICE: MinecraftServerService
// Fetches and caches live Minecraft server status
// Supports both public (mcsrvstat.us) and private servers with auth
// ============================================================

import { ServerStatus, RawServerStatusResponse } from "@/lib/models/ServerStatus";

interface CacheEntry {
  data: ServerStatus;
  expiresAt: number;
}

export class MinecraftServerService {
  private static readonly MCSRVSTAT_API_BASE = "https://api.mcsrvstat.us/3";
  private static readonly CACHE_TTL_MS = 30_000; // 30 seconds
  private static cache = new Map<string, CacheEntry>();

  private readonly host: string;
  private readonly port: number;
  private readonly isCustomApi: boolean; // true if port is not standard 25565
  private readonly apiToken?: string;

  constructor(host: string, port = 25565, apiToken?: string) {
    this.host = host;
    this.port = port;
    this.apiToken = apiToken;
    // Non-standard ports likely indicate custom APIs
    this.isCustomApi = port !== 25565;
  }

  private get cacheKey(): string {
    return `${this.host}:${this.port}`;
  }

  private get apiUrl(): string {
    if (this.isCustomApi) {
      // Direct API call for custom servers
      return `http://${this.host}:${this.port}/api/status`;
    }
    // Use public mcsrvstat.us for standard Minecraft servers
    return `${MinecraftServerService.MCSRVSTAT_API_BASE}/${this.host}:${this.port}`;
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

      // Build headers - include auth token for custom APIs
      const headers: Record<string, string> = {};
      if (this.isCustomApi && this.apiToken) {
        // Try common authentication methods
        headers["Authorization"] = `Bearer ${this.apiToken}`;
        headers["X-API-Token"] = this.apiToken;
      }

      // Next.js extends RequestInit with `next` for ISR/cache hints
      type NextFetchInit = RequestInit & { next?: { revalidate?: number } };
      const fetchOptions: NextFetchInit = {
        signal: controller.signal,
        headers,
        next: { revalidate: 30 },
      };

      const res = await fetch(this.apiUrl, fetchOptions);

      clearTimeout(timeout);

      // Don't throw on non-200 — just return offline
      if (!res.ok) {
        console.warn(
          `[MinecraftServerService] ${this.cacheKey} returned HTTP ${res.status}` +
          (this.isCustomApi && res.status === 403 ? " (missing/invalid API token?)" : "")
        );
        return ServerStatus.offline(this.host, this.port);
      }

      const raw: RawServerStatusResponse = await res.json();

      // Handle both mcsrvstat.us format and custom API responses
      const normalized: RawServerStatusResponse = this.isCustomApi
        ? raw // Custom APIs should already be in the right format
        : {
            // mcsrvstat.us wraps the player list differently — normalize it
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
    const apiToken = process.env.MC_SERVER_API_TOKEN; // Optional token for custom APIs
    return new MinecraftServerService(host, port, apiToken);
  }
}
