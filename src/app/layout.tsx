import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BlackArchive SMP",
    template: "%s | BlackArchive SMP",
  },
  description: "The official website for BlackArchive Minecraft SMP. Check server status, leaderboards, and player profiles.",
  openGraph: {
    type: "website",
    siteName: "BlackArchive SMP",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-zinc-950 text-white antialiased min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-white/30">
          © {new Date().getFullYear()} BlackArchive SMP · Not affiliated with Mojang
        </p>
        <div className="flex gap-4 text-sm text-white/30">
          <a href="/privacy" className="hover:text-white/60 transition-colors">Privacy</a>
          <a href="/rules" className="hover:text-white/60 transition-colors">Rules</a>
          <a href="https://discord.gg/dY5ExV9xt" className="hover:text-white/60 transition-colors">Discord</a>
        </div>
      </div>
    </footer>
  );
}