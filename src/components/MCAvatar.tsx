"use client";
// ============================================================
// COMPONENT: MCAvatar  (CLIENT COMPONENT)
// Must be "use client" — uses onError event handler.
// Server Components cannot have React event handlers.
// ============================================================

import { AvatarService, AvatarSize } from "@/lib/services/AvatarService";

interface MCBodyAvatarProps {
  uuid: string | null;
  username: string | null;
  /** Pixel height of the body render — width is auto-proportional */
  height?: number;
  className?: string;
}

/**
 * Full body render (head + torso + arms + legs).
 * Primary: Crafatar body render.  Fallback: Minotar avatar face.
 */
export function MCBodyAvatar({
  uuid,
  username,
  height = 160,
  className = "",
}: MCBodyAvatarProps) {
  const { primary, fallback } = AvatarService.getSmartUrls(
    uuid,
    username,
    "body",
    128
  );

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={primary}
      alt={username ?? "Player"}
      height={height}
      width={Math.round(height * 0.5)} // body aspect ratio ≈ 1:2
      onError={(e) => {
        const img = e.currentTarget;
        // Prevent infinite loop if fallback also fails
        if (img.src !== fallback) img.src = fallback;
      }}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

interface MCHeadAvatarProps {
  uuid: string | null;
  username: string | null;
  size?: AvatarSize;
  className?: string;
}

/**
 * 3-D head render.  Primary: Crafatar head.  Fallback: Minotar face.
 */
export function MCHeadAvatar({
  uuid,
  username,
  size = 64,
  className = "",
}: MCHeadAvatarProps) {
  const { primary, fallback } = AvatarService.getSmartUrls(
    uuid,
    username,
    "head",
    size
  );

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={primary}
      alt={username ?? "Player"}
      width={size}
      height={size}
      onError={(e) => {
        const img = e.currentTarget;
        if (img.src !== fallback) img.src = fallback;
      }}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
