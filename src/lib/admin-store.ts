import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase-client";
import { hashPassword } from "./passwords";
import { fromAdminSettingsRecord, toAdminSettingsRecord } from "./supabase-persistence";

export type AdminRole = "viewer" | "co-admin" | "admin";

export interface VehicleTypeItem {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KeyLocationItem {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: AdminRole;
  active: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

interface StoredAdminUser extends AdminUser {
  passwordHash?: string;
}

export interface DocumentRequirement {
  id: string;
  name: string;
  category?: string;
  required: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRuleSettings {
  enabled: boolean;
  scope: "all_vehicles" | "selected_vehicles" | "all_garages" | "selected_garages";
  selectedVehicleIds: string[];
  selectedGarageIds: string[];
}

export interface AdminSettings {
  vehicleTypes: VehicleTypeItem[];
  keyLocations: KeyLocationItem[];
  users: AdminUser[];
  documents: DocumentRequirement[];
  permissions: string[];
  notifications: NotificationRuleSettings;
}

interface StoredAdminSettings extends Omit<AdminSettings, "users"> {
  users: StoredAdminUser[];
}

const settingsFile = path.join(process.cwd(), "src/data/admin-settings.json");
const seededAdminPasswordHash = hashPassword("alpina123");

const defaultSettings: StoredAdminSettings = {
  vehicleTypes: [
    { id: "vt-1", name: "Classic car", description: "Heritage and concours vehicles", enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "vt-2", name: "Hypercar", description: "High-performance modern exotics", enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  keyLocations: [
    { id: "kl-1", name: "Primary vault", description: "Yehia Rashdan's main secure storage", enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "kl-2", name: "Secondary vault", description: "Yehia Rashdan's secondary secure storage", enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  users: [
    {
      id: "u-1",
      name: "Yehia Rashdan",
      username: "rashdan",
      email: "rashdan@collector-garage.dev",
      role: "admin",
      active: true,
      permissions: ["vehicles", "garages", "parking-spots", "notifications", "documents", "users", "vehicle-types", "key-locations"],
      passwordHash: seededAdminPasswordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  documents: [
    { id: "doc-1", name: "Proof of ownership", category: "legal", required: true, enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "doc-2", name: "Insurance certificate", category: "insurance", required: true, enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  permissions: ["vehicles", "garages", "parking-spots", "notifications", "documents", "users", "vehicle-types", "key-locations"],
  notifications: {
    enabled: true,
    scope: "all_vehicles",
    selectedVehicleIds: [],
    selectedGarageIds: [],
  },
};

function normalizeRole(role: string | undefined): AdminRole {
  if (role === "admin" || role === "co-admin" || role === "viewer") return role;
  if (role === "manager") return "co-admin";
  return "viewer";
}

function normalizeUsername(input: string | undefined, fallbackEmail: string, fallbackName: string) {
  const raw = input?.trim() || fallbackEmail.split("@")[0] || fallbackName;
  return raw.toLowerCase().replace(/\s+/g, "");
}

function sanitizeUser(user: StoredAdminUser): AdminUser {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    active: user.active,
    permissions: [...user.permissions],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function sanitizeSettings(settings: StoredAdminSettings): AdminSettings {
  return {
    vehicleTypes: settings.vehicleTypes,
    keyLocations: settings.keyLocations,
    users: settings.users.map(sanitizeUser),
    documents: settings.documents,
    permissions: settings.permissions,
    notifications: settings.notifications,
  };
}

function ensureSeedAdmin(settings: StoredAdminSettings) {
  const now = new Date().toISOString();
  const existing = settings.users.find((user) => user.username === "rashdan" || user.email === "rashdan@collector-garage.dev");

  if (existing) {
    existing.name = "Yehia Rashdan";
    existing.username = "rashdan";
    existing.email = existing.email || "rashdan@collector-garage.dev";
    existing.role = "admin";
    existing.active = true;
    existing.passwordHash = existing.passwordHash || seededAdminPasswordHash;
    existing.permissions = Array.from(new Set([...settings.permissions, ...existing.permissions]));
    existing.updatedAt = now;
    return settings;
  }

  settings.users.unshift({
    id: "u-1",
    name: "Yehia Rashdan",
    username: "rashdan",
    email: "rashdan@collector-garage.dev",
    role: "admin",
    active: true,
    permissions: [...settings.permissions],
    passwordHash: seededAdminPasswordHash,
    createdAt: now,
    updatedAt: now,
  });

  return settings;
}

function normalizeStoredSettings(parsed: Partial<StoredAdminSettings>): StoredAdminSettings {
  const users = Array.isArray(parsed.users)
    ? parsed.users.map((user) => {
        const email = user.email || `${normalizeUsername(user.username, "viewer", user.name || "viewer")}@collector-garage.dev`;
        return {
          id: user.id || randomUUID(),
          name: user.name || user.username || "User",
          username: normalizeUsername(user.username, email, user.name || "user"),
          email,
          role: normalizeRole(user.role),
          active: user.active ?? true,
          permissions: Array.isArray(user.permissions) ? user.permissions : [],
          passwordHash: user.passwordHash,
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString(),
        } as StoredAdminUser;
      })
    : defaultSettings.users;

  return ensureSeedAdmin({
    vehicleTypes: Array.isArray(parsed.vehicleTypes) ? parsed.vehicleTypes : defaultSettings.vehicleTypes,
    keyLocations: Array.isArray(parsed.keyLocations) ? parsed.keyLocations : defaultSettings.keyLocations,
    users,
    documents: Array.isArray(parsed.documents) ? parsed.documents : defaultSettings.documents,
    permissions: Array.isArray(parsed.permissions) ? parsed.permissions : defaultSettings.permissions,
    notifications: {
      enabled: parsed.notifications?.enabled ?? defaultSettings.notifications.enabled,
      scope: parsed.notifications?.scope ?? defaultSettings.notifications.scope,
      selectedVehicleIds: parsed.notifications?.selectedVehicleIds ?? [],
      selectedGarageIds: parsed.notifications?.selectedGarageIds ?? [],
    },
  });
}

async function writeSettings(settings: StoredAdminSettings) {
  const normalized = ensureSeedAdmin(settings);
  await fs.mkdir(path.dirname(settingsFile), { recursive: true });
  await fs.writeFile(settingsFile, JSON.stringify(normalized, null, 2), "utf8");

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const record = toAdminSettingsRecord(normalized);
        await supabase.from("admin_settings").upsert(record, { onConflict: "key" });
      }
    } catch {
      // keep local file as the source of truth when remote sync fails
    }
  }
}

async function readStoredSettings(): Promise<StoredAdminSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("admin_settings").select("*").eq("key", "collector_garage_admin").maybeSingle();
        if (!error && data?.value) {
          const parsed = fromAdminSettingsRecord(data as Record<string, unknown>) as Partial<StoredAdminSettings>;
          const normalized = normalizeStoredSettings(parsed);
          await writeSettings(normalized);
          return normalized;
        }
      }
    } catch {
      // fall back to the local file store below
    }
  }

  try {
    const raw = await fs.readFile(settingsFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoredAdminSettings>;
    const normalized = normalizeStoredSettings(parsed);
    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      await writeSettings(normalized);
    }
    return normalized;
  } catch {
    await writeSettings(defaultSettings);
    return defaultSettings;
  }
}

export async function getAdminSettings(): Promise<AdminSettings> {
  return sanitizeSettings(await readStoredSettings());
}

export async function findUserForLogin(username: string) {
  const settings = await readStoredSettings();
  const normalized = username.trim().toLowerCase();
  return settings.users.find((user) => user.username === normalized) ?? null;
}

export async function getStoredUserById(id: string) {
  const settings = await readStoredSettings();
  return settings.users.find((user) => user.id === id) ?? null;
}

export async function updateAdminSettings(next: Partial<AdminSettings>) {
  const current = await readStoredSettings();
  const updated: StoredAdminSettings = {
    ...current,
    ...next,
    vehicleTypes: next.vehicleTypes ?? current.vehicleTypes,
    keyLocations: next.keyLocations ?? current.keyLocations,
    users: current.users,
    documents: next.documents ?? current.documents,
    permissions: next.permissions ?? current.permissions,
    notifications: next.notifications ?? current.notifications,
  };
  await writeSettings(updated);
  return sanitizeSettings(updated);
}

export async function createVehicleType(input: Partial<VehicleTypeItem>) {
  const settings = await readStoredSettings();
  const item: VehicleTypeItem = {
    id: randomUUID(),
    name: input.name || "New vehicle type",
    description: input.description || undefined,
    enabled: input.enabled ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  settings.vehicleTypes.unshift(item);
  await writeSettings(settings);
  return item;
}

export async function updateVehicleType(id: string, input: Partial<VehicleTypeItem>) {
  const settings = await readStoredSettings();
  const index = settings.vehicleTypes.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Vehicle type not found");
  const updated = { ...settings.vehicleTypes[index], ...input, updatedAt: new Date().toISOString() };
  settings.vehicleTypes[index] = updated;
  await writeSettings(settings);
  return updated;
}

export async function deleteVehicleType(id: string) {
  const settings = await readStoredSettings();
  settings.vehicleTypes = settings.vehicleTypes.filter((item) => item.id !== id);
  await writeSettings(settings);
  return true;
}

export async function createKeyLocation(input: Partial<KeyLocationItem>) {
  const settings = await readStoredSettings();
  const item: KeyLocationItem = {
    id: randomUUID(),
    name: input.name || "New key location",
    description: input.description || undefined,
    enabled: input.enabled ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  settings.keyLocations.unshift(item);
  await writeSettings(settings);
  return item;
}

export async function updateKeyLocation(id: string, input: Partial<KeyLocationItem>) {
  const settings = await readStoredSettings();
  const index = settings.keyLocations.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Key location not found");
  const updated = { ...settings.keyLocations[index], ...input, updatedAt: new Date().toISOString() };
  settings.keyLocations[index] = updated;
  await writeSettings(settings);
  return updated;
}

export async function deleteKeyLocation(id: string) {
  const settings = await readStoredSettings();
  settings.keyLocations = settings.keyLocations.filter((item) => item.id !== id);
  await writeSettings(settings);
  return true;
}

export async function createUser(input: Partial<AdminUser> & { password?: string }) {
  if (!input.password?.trim()) throw new Error("Password is required");

  const settings = await readStoredSettings();
  const username = normalizeUsername(input.username, input.email || "user", input.name || "user");

  if (settings.users.some((user) => user.username === username)) {
    throw new Error("Username already exists");
  }

  const item: StoredAdminUser = {
    id: randomUUID(),
    name: input.name || username,
    username,
    email: input.email || `${username}@collector-garage.dev`,
    role: normalizeRole(input.role),
    active: input.active ?? true,
    permissions: input.permissions || [],
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  settings.users.unshift(item);
  await writeSettings(settings);
  return sanitizeUser(item);
}

export async function updateUser(id: string, input: Partial<AdminUser> & { password?: string }) {
  const settings = await readStoredSettings();
  const index = settings.users.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("User not found");

  const current = settings.users[index];
  const username = input.username
    ? normalizeUsername(input.username, input.email || current.email, input.name || current.name)
    : current.username;

  if (settings.users.some((user) => user.id !== id && user.username === username)) {
    throw new Error("Username already exists");
  }

  const updated: StoredAdminUser = {
    ...current,
    ...input,
    username,
    email: input.email || current.email,
    role: normalizeRole(input.role || current.role),
    updatedAt: new Date().toISOString(),
    passwordHash: input.password?.trim() ? hashPassword(input.password) : current.passwordHash,
  };

  settings.users[index] = updated;
  await writeSettings(settings);
  return sanitizeUser(updated);
}

export async function deleteUser(id: string) {
  const settings = await readStoredSettings();
  const target = settings.users.find((user) => user.id === id);
  if (!target) return true;
  if (target.username === "rashdan") throw new Error("The primary admin account cannot be deleted");
  settings.users = settings.users.filter((item) => item.id !== id);
  await writeSettings(settings);
  return true;
}

export async function createDocument(input: Partial<DocumentRequirement>) {
  const settings = await readStoredSettings();
  const item: DocumentRequirement = {
    id: randomUUID(),
    name: input.name || "New document requirement",
    category: input.category || undefined,
    required: input.required ?? true,
    enabled: input.enabled ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  settings.documents.unshift(item);
  await writeSettings(settings);
  return item;
}

export async function updateDocument(id: string, input: Partial<DocumentRequirement>) {
  const settings = await readStoredSettings();
  const index = settings.documents.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Document not found");
  const updated = { ...settings.documents[index], ...input, updatedAt: new Date().toISOString() };
  settings.documents[index] = updated;
  await writeSettings(settings);
  return updated;
}

export async function deleteDocument(id: string) {
  const settings = await readStoredSettings();
  settings.documents = settings.documents.filter((item) => item.id !== id);
  await writeSettings(settings);
  return true;
}

export async function createPermission(name: string) {
  const settings = await readStoredSettings();
  const normalized = name.trim();
  if (!normalized) throw new Error("Permission name is required");
  if (!settings.permissions.includes(normalized)) settings.permissions.unshift(normalized);
  await writeSettings(settings);
  return settings.permissions;
}

export async function deletePermission(name: string) {
  const settings = await readStoredSettings();
  settings.permissions = settings.permissions.filter((item) => item !== name);
  await writeSettings(settings);
  return settings.permissions;
}

export async function updateNotificationSettings(input: Partial<NotificationRuleSettings>) {
  const settings = await readStoredSettings();
  settings.notifications = {
    enabled: input.enabled ?? settings.notifications.enabled,
    scope: input.scope ?? settings.notifications.scope,
    selectedVehicleIds: input.selectedVehicleIds ?? settings.notifications.selectedVehicleIds,
    selectedGarageIds: input.selectedGarageIds ?? settings.notifications.selectedGarageIds,
  };
  await writeSettings(settings);
  return settings.notifications;
}
