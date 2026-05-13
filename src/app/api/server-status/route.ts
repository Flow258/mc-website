// ============================================================
// API ROUTE: GET /api/server-status
// Returns live Minecraft server status (cached 30s)
// ============================================================

import { NextResponse } from "next/server";
import { MinecraftServerService } from "@/lib/services/MinecraftServerService";

export const revalidate = 30; // ISR — regenerate every 30 seconds

export async function GET() {
  try {
    const service = MinecraftServerService.fromEnv();
    const status = await service.getStatus();

    return NextResponse.json(status.toJSON(), {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("[/api/server-status] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch server status" },
      { status: 500 }
    );
  }
}
