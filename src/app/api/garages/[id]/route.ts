import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session-auth";
import { requireSignedIn } from "@/lib/session-auth";
import { getGarage, updateGarage, deleteGarage } from "../../../../lib/garage-store";

export async function GET(req: Request, context: { params: any }) {
  const auth = await requireSignedIn();
  if ("response" in auth) return auth.response;
  const params = context.params;
  const realParams = typeof params?.then === 'function' ? await params : params;
  const id = realParams?.id as string | undefined;
  if (!id) return new Response(null, { status: 400 });
  const g = await getGarage(id);
  if (!g) return new Response(null, { status: 404 });
  return NextResponse.json(g);
}

export async function PUT(req: Request, context: { params: any }) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;
  const params = context.params;
  const realParams = typeof params?.then === 'function' ? await params : params;
  const id = realParams?.id as string | undefined;
  if (!id) return new Response(null, { status: 400 });
  const body = await req.json();
  const updated = await updateGarage(id, body || {});
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, context: { params: any }) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;
  const params = context.params;
  const realParams = typeof params?.then === 'function' ? await params : params;
  const id = realParams?.id as string | undefined;
  if (!id) return new Response(null, { status: 400 });
  await deleteGarage(id);
  return new Response(null, { status: 204 });
}
