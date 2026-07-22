import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session-auth";
import { uploadVehiclePhoto } from "@/lib/vehicle-photo-storage";

export async function POST(request: Request) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;

  const formData = await request.formData();
  const fileEntry = formData.get("file");

  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ error: "A photo file is required" }, { status: 400 });
  }

  const publicUrl = await uploadVehiclePhoto(fileEntry);
  if (!publicUrl) {
    return NextResponse.json({ error: "Unable to upload the photo right now" }, { status: 500 });
  }

  return NextResponse.json({ url: publicUrl });
}
