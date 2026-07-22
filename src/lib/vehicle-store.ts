import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase-client";
import { fromVehicleRecord, toVehicleRecord } from "./supabase-persistence";

export interface Vehicle {
  id: string;
  name: string;
  make?: string;
  model?: string;
  type: string;
  customType?: string;
  isPublic?: boolean;
  status?: string;
  year?: string;
  vin?: string;
  licensePlateNumber?: string;
  engineNumber?: string;
  color?: string;
  mileage?: string;
  location?: string;
  garage?: string;
  specs?: string;
  photos?: string;
  maintenanceRecords?: string;
  maintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceReminderEnabled?: boolean;
  licenseInfo?: string;
  licenceDate?: string;
  nextLicenceDate?: string;
  licenceReminderEnabled?: boolean;
  protectionDate?: string;
  nextProtectionDate?: string;
  protectionReminderEnabled?: boolean;
  restorationHistory?: string;
  tuningDetails?: string;
  spareKeys?: string;
  documents?: string;
  comments?: string;
  timeline?: string;
  createdAt: string;
  updatedAt: string;
}

const seedVehicles: Vehicle[] = [];

const filePath = path.join(process.cwd(), "src/data/vehicles.json");

async function writeVehicles(vehicles: Vehicle[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(vehicles, null, 2), "utf8");
}

export async function getVehicles() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map((item) => fromVehicleRecord(item as Record<string, unknown>));
        }
      }
    } catch {
      // fall back to local storage below
    }
  }

  try {
    const file = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(file) as Vehicle[];
    return Array.isArray(data) ? data : seedVehicles;
  } catch {
    await writeVehicles(seedVehicles);
    return seedVehicles;
  }
}

export async function createVehicle(input: Partial<Vehicle>) {
  const created: Vehicle = {
    id: randomUUID(),
    name: input.name || "Untitled collection piece",
    make: input.make || undefined,
    model: input.model || undefined,
    type: input.type || "Uncategorized",
    customType: input.customType || undefined,
    isPublic: input.isPublic ?? false,
    status: input.status || "active",
    year: input.year || undefined,
    vin: input.vin || undefined,
    licensePlateNumber: input.licensePlateNumber || undefined,
    engineNumber: input.engineNumber || undefined,
    color: input.color || undefined,
    mileage: input.mileage || undefined,
    location: input.location || undefined,
    garage: input.garage || undefined,
    specs: input.specs || undefined,
    photos: input.photos || undefined,
    maintenanceRecords: input.maintenanceRecords || undefined,
    maintenanceDate: input.maintenanceDate || undefined,
    nextMaintenanceDate: input.nextMaintenanceDate || undefined,
    maintenanceReminderEnabled: input.maintenanceReminderEnabled ?? false,
    licenseInfo: input.licenseInfo || undefined,
    licenceDate: input.licenceDate || undefined,
    nextLicenceDate: input.nextLicenceDate || undefined,
    licenceReminderEnabled: input.licenceReminderEnabled ?? false,
    protectionDate: input.protectionDate || undefined,
    nextProtectionDate: input.nextProtectionDate || undefined,
    protectionReminderEnabled: input.protectionReminderEnabled ?? false,
    restorationHistory: input.restorationHistory || undefined,
    tuningDetails: input.tuningDetails || undefined,
    spareKeys: input.spareKeys || undefined,
    documents: input.documents || undefined,
    comments: input.comments || undefined,
    timeline: input.timeline || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("vehicles").insert([toVehicleRecord(created)]).select().single();
        if (!error && data) {
          return fromVehicleRecord(data as Record<string, unknown>);
        }
      }
    } catch {
      // fall back to local storage below
    }
  }

  const vehicles = await getVehicles();
  vehicles.unshift(created);
  await writeVehicles(vehicles);
  return created;
}

export async function updateVehicle(id: string, input: Partial<Vehicle>) {
  const vehicles = await getVehicles();
  const current = vehicles.find((item) => item.id === id);
  if (!current) {
    throw new Error("Vehicle not found");
  }

  const updated = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  } as Vehicle;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("vehicles").update(toVehicleRecord(updated)).eq("id", id).select().single();
        if (!error && data) {
          return fromVehicleRecord(data as Record<string, unknown>);
        }
      }
    } catch {
      // fall back to local storage below
    }
  }

  const index = vehicles.findIndex((item) => item.id === id);

  if (index < 0) {
    throw new Error("Vehicle not found");
  }

  vehicles[index] = updated;
  await writeVehicles(vehicles);
  return updated;
}

export async function deleteVehicle(id: string) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("vehicles").delete().eq("id", id);
        if (!error) return;
      }
    } catch {
      // fall back to local storage below
    }
  }

  const vehicles = await getVehicles();
  const filtered = vehicles.filter((item) => item.id !== id);
  await writeVehicles(filtered);
}
