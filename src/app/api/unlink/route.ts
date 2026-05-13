// ============================================================
// API ROUTE: POST /api/unlink
// Called by the Minecraft plugin when a player runs /unlink
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-plugin-secret");
  if (secret !== process.env.PLUGIN_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const minecraftUuid = body?.minecraftUuid as string | undefined;

  if (!minecraftUuid) {
    return NextResponse.json({ error: "Missing minecraftUuid" }, { status: 400 });
  }

  const player = await db.player.findFirst({ where: { minecraftUuid } });
  if (!player) {
    return NextResponse.json({ error: "Player not linked" }, { status: 404 });
  }

  await db.player.update({
    where: { id: player.id },
    data: {
      minecraftUuid:     null,
      minecraftUsername: null,
      linkedAt:          null,
    },
  });

  return NextResponse.json({ success: true });
}
