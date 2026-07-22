import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session-auth";
import { assignVehicleToSpot } from "../../../../lib/garage-store";

export async function POST(req: Request) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;
  const body = await req.json();
  const { spotId, vehicleId } = body as { spotId: string; vehicleId?: string | null };
  const updated = await assignVehicleToSpot(spotId, vehicleId ?? null);
  return NextResponse.json(updated);
}
