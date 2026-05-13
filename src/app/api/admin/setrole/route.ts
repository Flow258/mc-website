// ============================================================
// API ROUTE: POST /api/admin/setrole
// Called by /ba setrole <player> <role> in-game
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_ROLES = ["MEMBER", "VIP", "ADMIN", "OWNER"] as const;
type Role = (typeof VALID_ROLES)[number];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-plugin-secret");
  if (secret !== process.env.PLUGIN_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { minecraftUsername, role } = body ?? {};

  if (!minecraftUsername || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!VALID_ROLES.includes(role as Role)) {
    return NextResponse.json(
      { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  const player = await db.player.findFirst({
    where: { minecraftUsername: { equals: minecraftUsername, mode: "insensitive" } },
  });

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  await db.player.update({
    where: { id: player.id },
    data:  { role: role as Role },
  });

  return NextResponse.json({ success: true, player: player.discordUsername, role });
}
