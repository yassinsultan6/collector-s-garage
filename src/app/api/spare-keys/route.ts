import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session-auth";
import { requireSignedIn } from "@/lib/session-auth";
import { createSpareKey, deleteSpareKey, getSpareKeys, getSpareKeysForVehicle } from "../../../lib/key-store";

export async function GET(req: Request) {
  const auth = await requireSignedIn();
  if ("response" in auth) return auth.response;
  const url = new URL(req.url);
  const vehicleId = url.searchParams.get("vehicleId");
  const list = vehicleId ? await getSpareKeysForVehicle(vehicleId) : await getSpareKeys();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;
  const body = await req.json();
  const created = await createSpareKey(body || {});
  return NextResponse.json(created);
}

export async function DELETE(req: Request) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response(null, { status: 400 });
  await deleteSpareKey(id);
  return new Response(null, { status: 204 });
}
