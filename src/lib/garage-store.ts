import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase-client";
import { fromGarageRecord, fromGarageSpotRecord, toGarageRecord, toGarageSpotRecord } from "./supabase-persistence";
import { getVehicles, updateVehicle } from "./vehicle-store";

export interface Garage {
  id: string;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GarageSpot {
  id: string;
  garageId: string;
  spotNumber?: string;
  description?: string;
  vehicleId?: string | null;
  createdAt: string;
  updatedAt: string;
}

const garagesFile = path.join(process.cwd(), "src/data/garages.json");
const spotsFile = path.join(process.cwd(), "src/data/garage_locations.json");

async function writeGarages(list: Garage[]) {
  await fs.mkdir(path.dirname(garagesFile), { recursive: true });
  await fs.writeFile(garagesFile, JSON.stringify(list, null, 2), "utf8");
}

async function writeSpots(list: GarageSpot[]) {
  await fs.mkdir(path.dirname(spotsFile), { recursive: true });
  await fs.writeFile(spotsFile, JSON.stringify(list, null, 2), "utf8");
}

export async function getGarages(): Promise<Garage[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("garages").select("*").order("created_at", { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map((item) => fromGarageRecord(item as Record<string, unknown>));
        }
      }
    } catch {
      // fall back to the local file store below
    }
  }

  try {
    const raw = await fs.readFile(garagesFile, "utf8");
    const data = JSON.parse(raw) as Garage[];
    return Array.isArray(data) ? data : [];
  } catch {
    await writeGarages([]);
    return [];
  }
}

export async function getGarage(id: string): Promise<Garage | null> {
  const list = await getGarages();
  return list.find((g) => g.id === id) ?? null;
}

export async function createGarage(input: Partial<Garage>) {
  const g: Garage = {
    id: randomUUID(),
    name: input.name || undefined,
    address: input.address || undefined,
    latitude: input.latitude || undefined,
    longitude: input.longitude || undefined,
    capacity: input.capacity || undefined,
    description: input.description || undefined,
    image: input.image || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Garage;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("garages").insert([toGarageRecord(g)]).select().single();
        if (!error && data) {
          return fromGarageRecord(data as Record<string, unknown>);
        }
      }
    } catch {
      // fall back to local file store below
    }
  }

  const list = await getGarages();
  list.unshift(g);
  await writeGarages(list);
  return g;
}

export async function updateGarage(id: string, input: Partial<Garage>) {
  const list = await getGarages();
  const idx = list.findIndex((g) => g.id === id);
  if (idx < 0) throw new Error("Garage not found");
  const updated = { ...list[idx], ...input, updatedAt: new Date().toISOString() } as Garage;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("garages").update(toGarageRecord(updated)).eq("id", id).select().single();
        if (!error && data) {
          return fromGarageRecord(data as Record<string, unknown>);
        }
      }
    } catch {
      // fall back to local file store below
    }
  }

  list[idx] = updated;
  await writeGarages(list);
  return updated;
}

export async function deleteGarage(id: string) {
  const list = await getGarages();
  const filtered = list.filter((g) => g.id !== id);
  await writeGarages(filtered);
  // Also clear spots
  const spots = await getSpots();
  const remaining = spots.filter((s) => s.garageId !== id);
  await writeSpots(remaining);
  // Unassign vehicles that referenced this garage
  const vehicles = await getVehicles();
  for (const v of vehicles.filter((v) => (v.garage as unknown as string) === id)) {
    try {
      await updateVehicle(v.id, { garage: undefined });
    } catch {}
  }
  return true;
}

export async function getSpots(): Promise<GarageSpot[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("garage_spots").select("*").order("created_at", { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map((item) => fromGarageSpotRecord(item as Record<string, unknown>));
        }
      }
    } catch {
      // fall back to the local file store below
    }
  }

  try {
    const raw = await fs.readFile(spotsFile, "utf8");
    const data = JSON.parse(raw) as GarageSpot[];
    return Array.isArray(data) ? data : [];
  } catch {
    await writeSpots([]);
    return [];
  }
}

export async function getSpotsForGarage(garageId: string) {
  const spots = await getSpots();
  return spots.filter((s) => s.garageId === garageId);
}

export async function createSpot(input: Partial<GarageSpot>) {
  const s: GarageSpot = {
    id: randomUUID(),
    garageId: input.garageId as string,
    spotNumber: input.spotNumber || undefined,
    description: input.description || undefined,
    vehicleId: input.vehicleId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as GarageSpot;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("garage_spots").insert([toGarageSpotRecord(s)]).select().single();
        if (!error && data) {
          return fromGarageSpotRecord(data as Record<string, unknown>);
        }
      }
    } catch {
      // fall back to local file store below
    }
  }

  const spots = await getSpots();
  spots.push(s);
  await writeSpots(spots);
  return s;
}

export async function updateSpot(id: string, input: Partial<GarageSpot>) {
  const spots = await getSpots();
  const idx = spots.findIndex((s) => s.id === id);
  if (idx < 0) throw new Error("Spot not found");
  const updated = { ...spots[idx], ...input, updatedAt: new Date().toISOString() } as GarageSpot;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("garage_spots").update(toGarageSpotRecord(updated)).eq("id", id).select().single();
        if (!error && data) {
          return fromGarageSpotRecord(data as Record<string, unknown>);
        }
      }
    } catch {
      // fall back to local file store below
    }
  }

  spots[idx] = updated;
  await writeSpots(spots);
  return updated;
}

export async function assignVehicleToSpot(spotId: string, vehicleId?: string | null) {
  const spots = await getSpots();
  const spot = spots.find((s) => s.id === spotId);
  if (!spot) throw new Error("Spot not found");
  spot.vehicleId = vehicleId ?? null;
  spot.updatedAt = new Date().toISOString();
  await writeSpots(spots);
  // Update vehicle record garage
  if (vehicleId) {
    try {
      await updateVehicle(vehicleId, { garage: spot.garageId });
    } catch {}
  }
  return spot;
}
