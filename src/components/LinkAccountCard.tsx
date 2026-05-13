"use client";
// ============================================================
// COMPONENT: LinkAccountCard
// Lets logged-in users generate a code to link their MC account
// ============================================================

import { useState } from "react";

interface LinkResult {
  code: string;
  instruction: string;
  expiresInMinutes: number;
}

// ── State machine for the linking flow ───────────────────────
type LinkState = "idle" | "loading" | "success" | "error";

export function LinkAccountCard() {
  const [state, setState] = useState<LinkState>("idle");
  const [result, setResult] = useState<LinkResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateCode = async () => {
    setState("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/link", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LinkResult = await res.json();
      setResult(data);
      setState("success");
    } catch (e) {
      setErrorMsg("Failed to generate code. Please try again.");
      setState("error");
    }
  };

  const copyCommand = () => {
    if (!result?.code) return;
    navigator.clipboard.writeText(`/link ${result.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
      <div>
        <h3 className="font-bold text-white text-lg">🔗 Link Minecraft Account</h3>
        <p className="text-sm text-white/50 mt-1">
          Connect your Minecraft account to appear on the leaderboard and track your stats.
        </p>
      </div>

      {/* Step list */}
      <ol className="space-y-2 text-sm text-white/60 list-decimal list-inside">
        <li>Click the button below to get a one-time code</li>
        <li>Join the server: <code className="text-white/80 font-mono">{process.env.NEXT_PUBLIC_MC_HOST ?? "play.yourserver.net"}</code></li>
        <li>Run the command shown in Minecraft chat</li>
      </ol>

      {/* Idle / Loading button */}
      {(state === "idle" || state === "loading" || state === "error") && (
        <button
          onClick={generateCode}
          disabled={state === "loading"}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors text-white font-semibold"
        >
          {state === "loading" ? "Generating…" : "Generate Link Code"}
        </button>
      )}

      {/* Error */}
      {state === "error" && errorMsg && (
        <p className="text-sm text-red-400">{errorMsg}</p>
      )}

      {/* Success: show code */}
      {state === "success" && result && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
          <p className="text-sm text-emerald-300 font-medium">
            ✓ Code generated! Expires in {result.expiresInMinutes} minutes.
          </p>

          <div className="flex items-center justify-between gap-3 bg-black/30 rounded-lg px-4 py-3">
            <code className="text-2xl font-black text-white tracking-widest font-mono">
              /link {result.code}
            </code>
            <button
              onClick={copyCommand}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>

          <p className="text-xs text-white/40">
            Paste this command into Minecraft chat to verify your account.
          </p>

          <button
            onClick={() => { setState("idle"); setResult(null); }}
            className="text-xs text-white/30 hover:text-white/60 transition-colors underline"
          >
            Generate new code
          </button>
        </div>
      )}
    </div>
  );
}
