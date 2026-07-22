import { NextResponse } from "next/server";
import { querySupabase } from "@/lib/supabase-client";
import { requireRole } from "@/lib/session-auth";
import { requireSignedIn } from "@/lib/session-auth";
import { getGarages, createGarage } from "../../../lib/garage-store";

export async function GET() {
  const auth = await requireSignedIn();
  if ("response" in auth) return auth.response;
  const supabaseResult = await querySupabase<{ id: string; name: string }>("garages");
  if (supabaseResult?.data && supabaseResult.data.length) {
    return NextResponse.json(supabaseResult.data);
  }

  const list = await getGarages();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;
  const body = await req.json();
  const created = await createGarage(body || {});
  return NextResponse.json(created);
}
