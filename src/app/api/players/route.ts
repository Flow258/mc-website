// ============================================================
// API ROUTE: GET /api/players?sort=playtimeMinutes&limit=10
// Returns leaderboard data
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { PlayerService, LeaderboardField } from "@/lib/services/PlayerService";

const VALID_SORT_FIELDS: LeaderboardField[] = [
  "playtimeMinutes",
  "kills",
  "kdr",
  "blocksPlaced",
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const sort = (searchParams.get("sort") ?? "playtimeMinutes") as LeaderboardField;
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 50);

    if (!VALID_SORT_FIELDS.includes(sort)) {
      return NextResponse.json({ error: "Invalid sort field" }, { status: 400 });
    }

    const service = PlayerService.create();
    const players = await service.getLeaderboard(sort, limit);

    return NextResponse.json({
      players: players.map((p) => p.toJSON()),
      sortedBy: sort,
      count: players.length,
    });
  } catch (err) {
    console.error("[/api/players] Error:", err);
    return NextResponse.json({ error: "Failed to load players" }, { status: 500 });
  }
}
