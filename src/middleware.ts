// ============================================================
// MIDDLEWARE
//
// Controls which routes NextAuth protects.
//
// The plugin calls /api/link, /api/stats, /api/unlink, and
// /api/admin/setrole with its own x-plugin-secret header —
// it never has a user session cookie.  If the middleware
// intercepts those routes it returns a 302 redirect to /login,
// which is why the plugin was getting "HTTP 302" errors.
//
// Rule: protect /profile* (must be logged in).
//       Leave everything else — especially all /api/* — alone.
// ============================================================

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;

  // Only enforce login on the user-facing profile pages.
  const isProtectedPage = pathname.startsWith("/profile");

  if (isProtectedPage && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  /*
   * Match ONLY the pages we want to protect.
   * Explicitly skip:
   *   - /api/*          all API routes (plugin + auth handlers)
   *   - /_next/*        Next.js internals
   *   - /favicon.ico    static asset
   */
  matcher: ["/profile", "/profile/:path*"],
};