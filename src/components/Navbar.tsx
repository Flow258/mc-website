"use client";
// ============================================================
// COMPONENT: Navbar
// Responsive navigation with Discord login / user menu
// ============================================================

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/",        label: "Home"        },
  { href: "/players", label: "Leaderboard" },
  { href: "/vote",    label: "Vote"        },
  { href: "/map",     label: "Map"         },
];

// ── User menu (avatar + dropdown) ────────────────────────────
function UserMenu({ user }: { user: { name?: string | null; image?: string | null; isLinked?: boolean } }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition-colors"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" width={24} height={24} className="rounded-full" />
        ) : (
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
            {user.name?.[0] ?? "?"}
          </span>
        )}
        <span className="text-sm text-white/80 max-w-[120px] truncate">{user.name}</span>
        <span className="text-white/40 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-zinc-900 shadow-xl z-50 overflow-hidden">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:bg-white/10 transition-colors"
          >
            👤 My Profile
          </Link>
          {!user.isLinked && (
            <Link
              href="/link"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm text-emerald-400 hover:bg-white/10 transition-colors"
            >
              🔗 Link Minecraft
            </Link>
          )}
          <hr className="border-white/10" />
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors"
          >
            ↩ Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function Navbar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="font-black text-white tracking-tight text-lg">
          ⛏ BlackArchive
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="w-20 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : session?.user ? (
            <UserMenu user={session.user as any} />
          ) : (
            <button
              onClick={() => signIn("discord")}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-medium text-white"
            >
              {/* Discord icon */}
              <svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor">
                <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5 0a.2.2 0 0 0-.2.1 40.6 40.6 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.4 37.4 0 0 0 25.5.1a.2.2 0 0 0-.2-.1A58.3 58.3 0 0 0 10.7 4.9C.2 20.8-2.2 36.3.7 51.6a.2.2 0 0 0 .1.1 58.8 58.8 0 0 0 17.7 9 .2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.9a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.2 36.2 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47 47 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.7 58.7 0 0 0 17.7-9 .2.2 0 0 0 .1-.1C73.4 33.9 70.3 18.5 60.1 5zM23.8 42.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 4-2.8 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 4-2.8 7.2-6.4 7.2z" />
              </svg>
              Login
            </button>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white/60 hover:text-white"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/80 px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
