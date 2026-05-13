// ============================================================
// NEXT.JS CONFIG
// Optimized for Cloudflare Pages deployment
// ============================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow MC avatar CDN images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "crafatar.com"          },
      { protocol: "https", hostname: "minotar.net"           },
      { protocol: "https", hostname: "cdn.discordapp.com"    },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },

  // Strict TypeScript + ESLint in CI
  typescript:  { ignoreBuildErrors: false },
  eslint:      { ignoreDuringBuilds: false },

  // Enable React strict mode
  reactStrictMode: true,
};

module.exports = nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
