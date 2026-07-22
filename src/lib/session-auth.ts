import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { findUserForLogin, getStoredUserById, type AdminRole } from "./admin-store";
import { verifyPassword } from "./passwords";

const SESSION_COOKIE_NAME = "collector_garage_session";
const SESSION_SECRET = process.env.APP_SESSION_SECRET ?? "collector-garage-session-secret";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export interface AppSession {
  userId: string;
  username: string;
  role: AdminRole;
  name: string;
  exp: number;
}

function sign(value: string) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

function serializeSession(session: AppSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function parseSession(token?: string | null) {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  if (signature.length !== expected.length) return null;

  const matches = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!matches) return null;

  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AppSession;
  if (!parsed.exp || parsed.exp < Date.now()) return null;
  return parsed;
}

export function hasAdminAccess(role?: AdminRole | null) {
  return role === "admin" || role === "co-admin";
}

export function canManagePrivilegedRoles(role?: AdminRole | null) {
  return role === "admin";
}

export async function createSessionFromCredentials(username: string, password: string) {
  const user = await findUserForLogin(username.trim().toLowerCase());
  if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  const session: AppSession = {
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    exp: Date.now() + SESSION_TTL_MS,
  };

  return session;
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const parsed = parseSession(token);
  if (!parsed) return null;

  const user = await getStoredUserById(parsed.userId);
  if (!user || !user.active) return null;

  return {
    ...parsed,
    role: user.role,
    username: user.username,
    name: user.name,
  } as AppSession;
}

export function applySessionCookie(response: NextResponse, session: AppSession) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: serializeSession(session),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function requireRole(roles: AdminRole[]) {
  const session = await getCurrentSession();
  if (!session) {
    return { response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }
  if (!roles.includes(session.role)) {
    return { response: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }) };
  }
  return { session };
}

export async function requireSignedIn() {
  const session = await getCurrentSession();
  if (!session) {
    return { response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }
  return { session };
}