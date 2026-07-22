import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session-auth";
import { requireSignedIn } from "@/lib/session-auth";
import { createSpot, getSpots, updateSpot } from "../../../lib/garage-store";

export async function GET() {
  const auth = await requireSignedIn();
  if ("response" in auth) return auth.response;
  const list = await getSpots();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;
  const body = await req.json();
  const created = await createSpot(body || {});
  return NextResponse.json(created);
}

import type { GarageSpot } from "../../../lib/garage-store";

export async function PUT(req: Request) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;
  const body = (await req.json()) as Partial<GarageSpot> & { id?: string };
  const { id, ...rest } = body;
  if (!id) return new Response(null, { status: 400 });
  const updated = await updateSpot(id, rest || {});
  return NextResponse.json(updated);
}
