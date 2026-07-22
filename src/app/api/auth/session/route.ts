import { NextResponse } from "next/server";
import { applySessionCookie, clearSessionCookie, createSessionFromCredentials, getCurrentSession, hasAdminAccess } from "@/lib/session-auth";

export async function GET() {
  const session = await getCurrentSession();

  return NextResponse.json({
    authenticated: Boolean(session),
    user: session
      ? {
          id: session.userId,
          username: session.username,
          name: session.name,
          role: session.role,
          canAccessAdmin: hasAdminAccess(session.role),
        }
      : null,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };
  const username = body.username?.trim();
  const password = body.password?.trim();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const session = await createSessionFromCredentials(username, password);
  if (!session) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const response = NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      username: session.username,
      name: session.name,
      role: session.role,
      canAccessAdmin: hasAdminAccess(session.role),
    },
  });

  applySessionCookie(response, session);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false, user: null });
  clearSessionCookie(response);
  return response;
}