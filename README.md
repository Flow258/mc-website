# ⛏ BlackArchive SMP Website

A **zero-cost** Minecraft server website built with Next.js 15, deployed on Cloudflare Pages.

---

## 🏗️ Architecture (OOP Lego Blocks)

```
src/
├── lib/
│   ├── models/
│   │   ├── ServerStatus.ts   ← Wraps raw API → rich typed object
│   │   └── Player.ts         ← Wraps DB row  → computed props (kdr, playtimeFormatted…)
│   ├── services/
│   │   ├── MinecraftServerService.ts  ← Fetches + caches MC server status
│   │   ├── AvatarService.ts           ← Generates Crafatar/Minotar CDN URLs
│   │   └── PlayerService.ts           ← All DB queries + mutations
│   ├── auth.ts               ← NextAuth v5 config
│   └── db.ts                 ← Prisma singleton
├── app/
│   ├── page.tsx              ← Homepage (hero + server card + top 3)
│   ├── players/page.tsx      ← Leaderboard with sort tabs
│   ├── profile/
│   │   ├── page.tsx          ← My Profile (auth required)
│   │   └── [username]/page.tsx  ← Public player profile
│   ├── login/page.tsx        ← Discord OAuth login
│   └── api/
│       ├── server-status/    ← GET  /api/server-status
│       ├── players/          ← GET  /api/players?sort=&limit=
│       ├── link/             ← POST /api/link  (gen code)
│       │                        PUT  /api/link  (confirm from plugin)
│       └── auth/[...nextauth]/ ← NextAuth handlers
└── components/
    ├── Navbar.tsx            ← Sticky nav + Discord login/user menu
    ├── ServerStatusCard.tsx  ← Live-polling server widget
    ├── PlayerCard.tsx        ← Player row with MC avatar
    └── LinkAccountCard.tsx   ← Generate link code UI
```

---

## 🚀 Quick Start (local dev)

### 1. Clone & install
```bash
git clone https://github.com/yourname/mc-website
cd mc-website
npm install
```

### 2. Set up environment
```bash
cp .env.example .env.local
# Fill in all values (see comments in file)
```

### 3. Set up database (free at neon.tech)
```bash
# Push schema to Neon PostgreSQL
npm run db:push

# Seed with fake players for testing
npm run db:seed
```

### 4. Set up Discord OAuth (free)
1. Go to https://discord.com/developers/applications
2. Click **New Application**
3. Go to **OAuth2** → copy Client ID and Secret → paste into `.env.local`
4. Add redirect URI: `http://localhost:3000/api/auth/callback/discord`

### 5. Run
```bash
npm run dev
# Open http://localhost:3000
```

---

## ☁️ Deploy to Cloudflare Pages (free)

```bash
# 1. Push to GitHub
git add . && git commit -m "Initial commit" && git push

# 2. Go to https://pages.cloudflare.com
# 3. Connect your GitHub repo
# 4. Build settings:
#    - Framework preset: Next.js
#    - Build command:    npm run build
#    - Output dir:       .next

# 5. Add environment variables (same as .env.local)
#    → Settings → Environment Variables
```

> **Important**: Add your production URL to Discord OAuth redirect URIs:
> `https://your-project.pages.dev/api/auth/callback/discord`

---

## 🔌 Minecraft Plugin Integration

Your plugin calls the link confirmation endpoint when a player runs `/link CODE`:

```java
// Java plugin example (Paper/Spigot)
String url = "https://your-site.pages.dev/api/link";
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create(url))
    .header("Content-Type", "application/json")
    .header("x-plugin-secret", "YOUR_PLUGIN_SECRET")  // from .env
    .PUT(HttpRequest.BodyPublishers.ofString(
        "{\"code\":\"" + code + "\"," +
        "\"minecraftUuid\":\"" + player.getUniqueId() + "\"," +
        "\"minecraftUsername\":\"" + player.getName() + "\"}"
    ))
    .build();
```

For stats sync, call `PATCH /api/players/stats` (extend as needed).

---

## 💰 Cost breakdown

| Service | Free tier | Used |
|---------|-----------|------|
| Cloudflare Pages | Unlimited bandwidth | Hosting |
| Neon PostgreSQL  | 500MB storage       | Database |
| mcsrvstat.us API | Unlimited           | Server status |
| Crafatar CDN     | Unlimited           | Player avatars |
| Discord OAuth    | Free forever        | Authentication |
| **Total**        | **$0/month**        | ✅ |

---

## 📦 Tech Stack

- **Next.js 15** — App Router, Server Components, ISR
- **NextAuth v5** — Discord OAuth, JWT sessions
- **Prisma ORM** — Type-safe database access
- **PostgreSQL** — Via Neon.tech free tier
- **Tailwind CSS** — Utility-first styling
- **TypeScript** — Full type safety end-to-end
