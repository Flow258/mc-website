"use client";
// ============================================================
// PROVIDERS
// Client-side wrapper for all context providers.
// MUST be "use client" — SessionProvider needs browser context.
// Imported by the root layout (which is a Server Component).
// ============================================================

import { SessionProvider } from "next-auth/react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
