import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export interface KeyLocation {
  id: string;
  name?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpareKey {
  id: string;
  vehicleId: string;
  keyType?: string;
  status?: string;
  locationId?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const keyLocationsFile = path.join(process.cwd(), "src/data/key_locations.json");
const spareKeysFile = path.join(process.cwd(), "src/data/spare_keys.json");

async function writeKeyLocations(list: KeyLocation[]) {
  await fs.mkdir(path.dirname(keyLocationsFile), { recursive: true });
  await fs.writeFile(keyLocationsFile, JSON.stringify(list, null, 2), "utf8");
}

async function writeSpareKeys(list: SpareKey[]) {
  await fs.mkdir(path.dirname(spareKeysFile), { recursive: true });
  await fs.writeFile(spareKeysFile, JSON.stringify(list, null, 2), "utf8");
}

export async function getKeyLocations(): Promise<KeyLocation[]> {
  try {
    const raw = await fs.readFile(keyLocationsFile, "utf8");
    const data = JSON.parse(raw) as KeyLocation[];
    return Array.isArray(data) ? data : [];
  } catch {
    await writeKeyLocations([]);
    return [];
  }
}

export async function createKeyLocation(input: Partial<KeyLocation>) {
  const list = await getKeyLocations();
  const item: KeyLocation = {
    id: randomUUID(),
    name: input.name || undefined,
    description: input.description || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  list.unshift(item);
  await writeKeyLocations(list);
  return item;
}

export async function getSpareKeys(): Promise<SpareKey[]> {
  try {
    const raw = await fs.readFile(spareKeysFile, "utf8");
    const data = JSON.parse(raw) as SpareKey[];
    return Array.isArray(data) ? data : [];
  } catch {
    await writeSpareKeys([]);
    return [];
  }
}

export async function getSpareKeysForVehicle(vehicleId: string): Promise<SpareKey[]> {
  const list = await getSpareKeys();
  return list.filter((item) => item.vehicleId === vehicleId);
}

export async function createSpareKey(input: Partial<SpareKey>) {
  const list = await getSpareKeys();
  const item: SpareKey = {
    id: randomUUID(),
    vehicleId: input.vehicleId || "",
    keyType: input.keyType || undefined,
    status: input.status || undefined,
    locationId: input.locationId ?? null,
    notes: input.notes || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  list.unshift(item);
  await writeSpareKeys(list);
  return item;
}

export async function deleteSpareKey(id: string) {
  const list = await getSpareKeys();
  const filtered = list.filter((item) => item.id !== id);
  await writeSpareKeys(filtered);
  return true;
}
