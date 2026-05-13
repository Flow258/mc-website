"use client";
// ============================================================
// PAGE: /login
// Simple Discord OAuth sign-in screen
// ============================================================

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") router.replace("/profile");
  }, [status, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 animate-fade-up">
        {/* Logo */}
        <div className="text-center">
          <p className="text-5xl mb-4">⛏</p>
          <h1 className="text-3xl font-black text-white">BlackArchive</h1>
          <p className="text-white/40 mt-2">Sign in to track your stats</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">Welcome back</h2>
            <p className="text-sm text-white/50">
              Log in with your Discord account to access your profile,
              link your Minecraft account, and appear on the leaderboard.
            </p>
          </div>

          <button
            onClick={() => signIn("discord", { callbackUrl: "/profile" })}
            disabled={status === "loading"}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors font-semibold text-white"
          >
            {/* Discord logo */}
            <svg width="20" height="15" viewBox="0 0 71 55" fill="currentColor">
              <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5 0a.2.2 0 0 0-.2.1 40.6 40.6 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.4 37.4 0 0 0 25.5.1a.2.2 0 0 0-.2-.1A58.3 58.3 0 0 0 10.7 4.9C.2 20.8-2.2 36.3.7 51.6a.2.2 0 0 0 .1.1 58.8 58.8 0 0 0 17.7 9 .2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.9a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.2 36.2 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47 47 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.7 58.7 0 0 0 17.7-9 .2.2 0 0 0 .1-.1C73.4 33.9 70.3 18.5 60.1 5zM23.8 42.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 4-2.8 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 4-2.8 7.2-6.4 7.2z" />
            </svg>
            Continue with Discord
          </button>

          <p className="text-xs text-center text-white/25">
            By signing in you agree to our{" "}
            <a href="/rules" className="underline hover:text-white/50 transition-colors">rules</a>
            {" "}and{" "}
            <a href="/privacy" className="underline hover:text-white/50 transition-colors">privacy policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
