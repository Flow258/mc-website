// ============================================================
// MODEL: ServerStatus
// Represents the live status of a Minecraft server
// ============================================================

export interface RawServerStatusResponse {
  online: boolean;
  host: string;
  port: number;
  players?: {
    online: number;
    max: number;
    list?: string[];
  };
  version?: {
    name: string;
    protocol: number;
  };
  motd?: {
    raw: string;
    clean: string;
    html: string;
  };
  icon?: string;
  latency?: number;
}

export class ServerStatus {
  readonly isOnline: boolean;
  readonly host: string;
  readonly port: number;
  readonly playersOnline: number;
  readonly playersMax: number;
  readonly playerList: string[];
  readonly versionName: string;
  readonly motd: string;
  readonly motdClean: string;
  readonly icon: string | null;
  readonly latencyMs: number;
  readonly fetchedAt: Date;

  constructor(raw: RawServerStatusResponse) {
    this.isOnline = raw.online;
    this.host = raw.host;
    this.port = raw.port;
    this.playersOnline = raw.players?.online ?? 0;
    this.playersMax = raw.players?.max ?? 0;
    this.playerList = raw.players?.list ?? [];
    this.versionName = raw.version?.name ?? "Unknown";
    this.motd = raw.motd?.raw ?? "";
    this.motdClean = raw.motd?.clean ?? "";
    this.icon = raw.icon ?? null;
    this.latencyMs = raw.latency ?? -1;
    this.fetchedAt = new Date();
  }

  /** Friendly server address (host:port or just host if default port) */
  get address(): string {
    return this.port === 25565 ? this.host : `${this.host}:${this.port}`;
  }

  /** Player occupancy as a 0–100 percentage */
  get occupancyPercent(): number {
    if (this.playersMax === 0) return 0;
    return Math.round((this.playersOnline / this.playersMax) * 100);
  }

  /** Whether the server is full */
  get isFull(): boolean {
    return this.playersOnline >= this.playersMax;
  }

  /** Human-readable latency string */
  get latencyLabel(): string {
    if (this.latencyMs < 0) return "N/A";
    if (this.latencyMs < 80) return `${this.latencyMs}ms ⚡`;
    if (this.latencyMs < 200) return `${this.latencyMs}ms`;
    return `${this.latencyMs}ms 🐢`;
  }

  /** Serialize to plain object for JSON responses */
  toJSON() {
    return {
      isOnline: this.isOnline,
      host: this.host,
      port: this.port,
      address: this.address,
      players: {
        online: this.playersOnline,
        max: this.playersMax,
        list: this.playerList,
        occupancyPercent: this.occupancyPercent,
      },
      version: this.versionName,
      motdClean: this.motdClean,
      icon: this.icon,
      latencyMs: this.latencyMs,
      fetchedAt: this.fetchedAt.toISOString(),
    };
  }

  /** Create an offline placeholder when the server cannot be reached */
  static offline(host: string, port = 25565): ServerStatus {
    return new ServerStatus({ online: false, host, port });
  }
}
