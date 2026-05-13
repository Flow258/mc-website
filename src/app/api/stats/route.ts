// ============================================================
// API ROUTE: POST /api/stats
// Called by the Minecraft plugin every N minutes with
// an array of stat delta payloads for all online players.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { PlayerService } from "@/lib/services/PlayerService";

interface StatPayload {
  minecraftUuid:     string;
  minecraftUsername: string;
  kills:             number;
  deaths:            number;
  blocksPlaced:      number;
  blocksBroken:      number;
  playtimeMinutes:   number;
}

export async function POST(req: NextRequest) {
  // Authenticate the plugin
  const secret = req.headers.get("x-plugin-secret");
  if (secret !== process.env.PLUGIN_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payloads: StatPayload[];
  try {
    payloads = await req.json();
    if (!Array.isArray(payloads)) throw new Error("Expected array");
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (payloads.length === 0) {
    return NextResponse.json({ updated: 0 });
  }

  const service = PlayerService.create();
  let updated = 0;

  // Process each player's delta concurrently
  await Promise.allSettled(
    payloads.map(async (p) => {
      if (!p.minecraftUuid) return;
      try {
        await service.updateStats(p.minecraftUuid, {
          kills:           p.kills           ?? 0,
          deaths:          p.deaths          ?? 0,
          blocksPlaced:    p.blocksPlaced     ?? 0,
          blocksBroken:    p.blocksBroken     ?? 0,
          playtimeMinutes: p.playtimeMinutes  ?? 0,
        });
        updated++;
      } catch (err) {
        console.error(`[/api/stats] Failed update for ${p.minecraftUsername}:`, err);
      }
    })
  );

  return NextResponse.json({ updated });
}
