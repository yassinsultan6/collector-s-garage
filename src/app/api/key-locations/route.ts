import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session-auth";
import { requireSignedIn } from "@/lib/session-auth";
import { createKeyLocation, getKeyLocations } from "../../../lib/key-store";

export async function GET() {
  const auth = await requireSignedIn();
  if ("response" in auth) return auth.response;
  const list = await getKeyLocations();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;
  const body = await req.json();
  const created = await createKeyLocation(body || {});
  return NextResponse.json(created);
}
