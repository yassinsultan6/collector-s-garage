import { NextResponse } from "next/server";
import {
  createDocument,
  createKeyLocation,
  createPermission,
  createUser,
  createVehicleType,
  deleteDocument,
  deleteKeyLocation,
  deletePermission,
  deleteUser,
  deleteVehicleType,
  getAdminSettings,
  updateAdminSettings,
  updateDocument,
  updateKeyLocation,
  updateNotificationSettings,
  updateUser,
  updateVehicleType,
} from "../../../lib/admin-store";
import { canManagePrivilegedRoles, requireRole } from "@/lib/session-auth";

export async function GET() {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;
  const settings = await getAdminSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;
  const body = await request.json();
  const action = body?.action as string | undefined;

  try {
    switch (action) {
      case "createVehicleType":
        return NextResponse.json(await createVehicleType(body?.payload || {}));
      case "updateVehicleType":
        return NextResponse.json(await updateVehicleType(body?.id, body?.payload || {}));
      case "deleteVehicleType":
        return NextResponse.json(await deleteVehicleType(body?.id));
      case "createKeyLocation":
        return NextResponse.json(await createKeyLocation(body?.payload || {}));
      case "updateKeyLocation":
        return NextResponse.json(await updateKeyLocation(body?.id, body?.payload || {}));
      case "deleteKeyLocation":
        return NextResponse.json(await deleteKeyLocation(body?.id));
      case "createUser":
        if (!canManagePrivilegedRoles(auth.session.role) && ["admin", "co-admin"].includes(body?.payload?.role)) {
          return NextResponse.json({ error: "Only admins can create admin or co-admin accounts" }, { status: 403 });
        }
        return NextResponse.json(await createUser(body?.payload || {}));
      case "updateUser":
        if (!canManagePrivilegedRoles(auth.session.role) && ["admin", "co-admin"].includes(body?.payload?.role)) {
          return NextResponse.json({ error: "Only admins can assign admin or co-admin roles" }, { status: 403 });
        }
        return NextResponse.json(await updateUser(body?.id, body?.payload || {}));
      case "deleteUser":
        if (!canManagePrivilegedRoles(auth.session.role)) {
          return NextResponse.json({ error: "Only admins can delete user accounts" }, { status: 403 });
        }
        return NextResponse.json(await deleteUser(body?.id));
      case "createDocument":
        return NextResponse.json(await createDocument(body?.payload || {}));
      case "updateDocument":
        return NextResponse.json(await updateDocument(body?.id, body?.payload || {}));
      case "deleteDocument":
        return NextResponse.json(await deleteDocument(body?.id));
      case "createPermission":
        return NextResponse.json(await createPermission(body?.payload?.name || body?.name));
      case "deletePermission":
        return NextResponse.json(await deletePermission(body?.payload?.name || body?.name));
      case "updateNotificationSettings":
        return NextResponse.json(await updateNotificationSettings(body?.payload || {}));
      case "updateAdminSettings":
        return NextResponse.json(await updateAdminSettings(body?.payload || {}));
      default:
        return NextResponse.json({ error: "Unsupported admin action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
