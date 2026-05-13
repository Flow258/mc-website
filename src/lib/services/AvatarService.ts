// ============================================================
// SERVICE: AvatarService
// Generates free CDN URLs for Minecraft player head renders
// Providers: Crafatar (primary), Minotar (fallback)
// ============================================================

export type AvatarSize = 16 | 32 | 64 | 128 | 256;
export type AvatarType = "avatar" | "head" | "body" | "bust";

export class AvatarService {
  private static readonly CRAFATAR_BASE = "https://crafatar.com";
  private static readonly MINOTAR_BASE = "https://minotar.net";

  /** 2D face avatar (fastest to load) */
  static getAvatarUrl(
    usernameOrUuid: string,
    size: AvatarSize = 64,
    overlay = true
  ): string {
    const overlayParam = overlay ? "&overlay" : "";
    return `${this.CRAFATAR_BASE}/avatars/${usernameOrUuid}?size=${size}${overlayParam}`;
  }

  /** 3D rendered head */
  static getHeadUrl(usernameOrUuid: string, size: AvatarSize = 64): string {
    return `${this.CRAFATAR_BASE}/renders/head/${usernameOrUuid}?size=${size}&overlay`;
  }

  /** Full 3D body render */
  static getBodyUrl(usernameOrUuid: string, size: AvatarSize = 128): string {
    return `${this.CRAFATAR_BASE}/renders/body/${usernameOrUuid}?size=${size}&overlay`;
  }

  /** Bust (head + shoulders) render */
  static getBustUrl(usernameOrUuid: string, size: AvatarSize = 128): string {
    return `${this.CRAFATAR_BASE}/renders/bust/${usernameOrUuid}?size=${size}&overlay`;
  }

  /** Skin texture file URL */
  static getSkinUrl(usernameOrUuid: string): string {
    return `${this.CRAFATAR_BASE}/skins/${usernameOrUuid}`;
  }

  /** Minotar fallback URL (useful as <img> onerror target) */
  static getFallbackUrl(username: string, size: AvatarSize = 64): string {
    return `${this.MINOTAR_BASE}/avatar/${username}/${size}`;
  }

  /**
   * Smart URL — tries UUID first (stable), falls back to username.
   * Returns a tuple [primary, fallback] for use in <img src> + onerror.
   */
  static getSmartUrls(
    uuid: string | null,
    username: string | null,
    type: AvatarType = "avatar",
    size: AvatarSize = 64
  ): { primary: string; fallback: string } {
    const identifier = uuid ?? username ?? "MHF_Steve";

    const primary = (() => {
      switch (type) {
        case "head": return this.getHeadUrl(identifier, size);
        case "body": return this.getBodyUrl(identifier, size as AvatarSize);
        case "bust": return this.getBustUrl(identifier, size as AvatarSize);
        default:     return this.getAvatarUrl(identifier, size);
      }
    })();

    const fallback = username
      ? this.getFallbackUrl(username, size)
      : this.getFallbackUrl("MHF_Steve", size);

    return { primary, fallback };
  }
}
