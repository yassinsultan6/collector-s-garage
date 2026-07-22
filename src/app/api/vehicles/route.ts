import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session-auth";
import { querySupabase } from "@/lib/supabase-client";
import { requireRole } from "@/lib/session-auth";
import { createVehicle, deleteVehicle, getVehicles, updateVehicle } from "@/lib/vehicle-store";

function toPublicVehicle(input: Record<string, unknown>) {
  return {
    id: input.id,
    name: input.name,
    make: input.make,
    model: input.model,
    type: input.type,
    customType: input.customType ?? input.custom_type,
    photos: input.photos,
    year: input.year,
    status: input.status ?? input.vehicle_status,
    color: input.color,
    mileage: input.mileage,
    timeline: input.timeline,
    restorationHistory: input.restorationHistory ?? input.restoration_history,
  };
}

export async function GET() {
  const session = await getCurrentSession();
  const includePrivate = Boolean(session);

  const supabaseResult = await querySupabase<Record<string, unknown>>("vehicles");
  if (supabaseResult?.data && supabaseResult.data.length) {
    const items = supabaseResult.data as Record<string, unknown>[];
    if (includePrivate) {
      return NextResponse.json(items);
    }

    return NextResponse.json(items.filter((item) => Boolean(item.is_public ?? item.isPublic)).map((item) => toPublicVehicle(item)));
  }

  const vehicles = await getVehicles();
  if (includePrivate) {
    return NextResponse.json(vehicles);
  }

  return NextResponse.json(vehicles.filter((item) => item.isPublic).map((item) => toPublicVehicle(item as unknown as Record<string, unknown>)));
}

export async function POST(request: Request) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;
  const payload = await request.json();
  const vehicle = await createVehicle(payload);
  return NextResponse.json(vehicle, { status: 201 });
}

export async function PUT(request: Request) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;

  const body = (await request.json()) as { id?: string } & Record<string, unknown>;
  const { id, ...changes } = body;
  if (!id) {
    return NextResponse.json({ error: "Vehicle id is required" }, { status: 400 });
  }

  const vehicle = await updateVehicle(id, changes);
  return NextResponse.json(vehicle);
}

export async function DELETE(request: Request) {
  const auth = await requireRole(["admin", "co-admin"]);
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Vehicle id is required" }, { status: 400 });
  }

  await deleteVehicle(id);
  return NextResponse.json({ success: true });
}
