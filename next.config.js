// ============================================================
// NEXT.JS CONFIG
//
// @opennextjs/cloudflare must NOT be imported here.
// It only runs via `opennextjs-cloudflare build` at deploy time.
// Importing it here breaks local `next dev`.
//
// The open-next.config.ts file is for the Cloudflare CLI only.
// ============================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "crafatar.com"                  },
      { protocol: "https", hostname: "minotar.net"                   },
      { protocol: "https", hostname: "cdn.discordapp.com"            },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  typescript:      { ignoreBuildErrors: false },
  eslint:          { ignoreDuringBuilds: false },
  reactStrictMode: true,
};

module.exports = nextConfig;