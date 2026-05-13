// ============================================================
// API ROUTE: POST /api/link
//   body: {} → generates a link code for the logged-in user
//
// API ROUTE: PUT /api/link
//   body: { code, minecraftUuid, minecraftUsername }
//   → called by your Minecraft plugin to confirm the link
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PlayerService } from "@/lib/services/PlayerService";

const service = PlayerService.create();

// Generate a link code (requires Discord login)
export async function POST() {
  const session = await auth();
  if (!session?.user?.discordId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = await service.generateLinkCode(session.user.discordId);

  return NextResponse.json({
    code,
    instruction: `Run /link ${code} in Minecraft within 10 minutes`,
    expiresInMinutes: 10,
  });
}

// Confirm the link — called by Minecraft plugin (protect with a shared secret)
export async function PUT(req: NextRequest) {
  const secret = req.headers.get("x-plugin-secret");
  if (secret !== process.env.PLUGIN_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { code, minecraftUuid, minecraftUsername } = body;

  if (!code || !minecraftUuid || !minecraftUsername) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const player = await service.confirmLink(code, minecraftUuid, minecraftUsername);
  if (!player) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 404 });
  }

  return NextResponse.json({ success: true, player: player.toJSON() });
}
