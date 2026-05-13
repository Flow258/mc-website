// ============================================================
// MODEL: Player
// Represents a linked Discord + Minecraft player account
// ============================================================

export interface RawPlayerRow {
  id: string;
  discordId: string;
  discordUsername: string;
  discordAvatar: string | null;
  minecraftUuid: string | null;
  minecraftUsername: string | null;
  linkedAt: Date | null;
  joinedAt: Date;
  playtimeMinutes: number;
  kills: number;
  deaths: number;
  blocksPlaced: number;
  blocksBroken: number;
  role: "MEMBER" | "VIP" | "ADMIN" | "OWNER";
}

export class Player {
  readonly id: string;
  readonly discordId: string;
  readonly discordUsername: string;
  readonly discordAvatar: string | null;
  readonly minecraftUuid: string | null;
  readonly minecraftUsername: string | null;
  readonly linkedAt: Date | null;
  readonly joinedAt: Date;
  readonly playtimeMinutes: number;
  readonly kills: number;
  readonly deaths: number;
  readonly blocksPlaced: number;
  readonly blocksBroken: number;
  readonly role: RawPlayerRow["role"];

  constructor(raw: RawPlayerRow) {
    this.id = raw.id;
    this.discordId = raw.discordId;
    this.discordUsername = raw.discordUsername;
    this.discordAvatar = raw.discordAvatar;
    this.minecraftUuid = raw.minecraftUuid;
    this.minecraftUsername = raw.minecraftUsername;
    this.linkedAt = raw.linkedAt;
    this.joinedAt = raw.joinedAt;
    this.playtimeMinutes = raw.playtimeMinutes;
    this.kills = raw.kills;
    this.deaths = raw.deaths;
    this.blocksPlaced = raw.blocksPlaced;
    this.blocksBroken = raw.blocksBroken;
    this.role = raw.role;
  }

  /** Whether the player has linked their Minecraft account */
  get isLinked(): boolean {
    return this.minecraftUuid !== null && this.minecraftUsername !== null;
  }

  /** Kill/Death ratio, returns 0 if no deaths */
  get kdr(): number {
    if (this.deaths === 0) return this.kills;
    return Math.round((this.kills / this.deaths) * 100) / 100;
  }

  /** Playtime formatted as "Xh Ym" */
  get playtimeFormatted(): string {
    const hours = Math.floor(this.playtimeMinutes / 60);
    const minutes = this.playtimeMinutes % 60;
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }

  /** Display name — Minecraft username if linked, otherwise Discord username */
  get displayName(): string {
    return this.minecraftUsername ?? this.discordUsername;
  }

  /** Role badge label */
  get roleBadge(): string {
    const badges: Record<RawPlayerRow["role"], string> = {
      MEMBER: "Member",
      VIP: "⭐ VIP",
      ADMIN: "🛡 Admin",
      OWNER: "👑 Owner",
    };
    return badges[this.role];
  }

  /** Role color CSS class */
  get roleColor(): string {
    const colors: Record<RawPlayerRow["role"], string> = {
      MEMBER: "text-gray-400",
      VIP: "text-yellow-400",
      ADMIN: "text-blue-400",
      OWNER: "text-red-400",
    };
    return colors[this.role];
  }

  toJSON() {
    return {
      id: this.id,
      discordId: this.discordId,
      displayName: this.displayName,
      discordUsername: this.discordUsername,
      discordAvatar: this.discordAvatar,
      minecraft: this.isLinked
        ? { uuid: this.minecraftUuid, username: this.minecraftUsername, linkedAt: this.linkedAt }
        : null,
      stats: {
        playtimeMinutes: this.playtimeMinutes,
        playtimeFormatted: this.playtimeFormatted,
        kills: this.kills,
        deaths: this.deaths,
        kdr: this.kdr,
        blocksPlaced: this.blocksPlaced,
        blocksBroken: this.blocksBroken,
      },
      role: this.role,
      roleBadge: this.roleBadge,
      joinedAt: this.joinedAt.toISOString(),
    };
  }
}
