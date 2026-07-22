import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session-auth";
import { requireSignedIn } from "@/lib/session-auth";
import { createNotification, getNotifications, updateNotification, getNotificationSummary } from "../../../lib/notification-store";

export async function GET() {
  const auth = await requireSignedIn();
  if ("response" in auth) return auth.response;
  const list = await getNotificationSummary();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;
  const body = await req.json();
  const created = await createNotification(body || {});
  return NextResponse.json(created);
}

export async function PUT(req: Request) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;
  const body = await req.json();
  const { id, ...changes } = body as { id?: string } & Record<string, unknown>;
  if (!id) return new Response(null, { status: 400 });
  const updated = await updateNotification(id, changes as any);
  return NextResponse.json(updated);
}
