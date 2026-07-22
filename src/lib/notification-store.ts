import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase-client";
import { fromNotificationRecord, toNotificationRecord } from "./supabase-persistence";
import { getVehicles } from "./vehicle-store";

export type NotificationType = "license" | "licence" | "registration" | "insurance" | "protection" | "maintenance";
export type NotificationStatus = "upcoming" | "due_soon" | "overdue" | "completed";

export interface NotificationTask {
  id: string;
  vehicleId?: string;
  garageId?: string;
  type: NotificationType;
  title: string;
  dueDate: string;
  status: NotificationStatus;
  enabled: boolean;
  completed: boolean;
  readonly?: boolean;
  lastSentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  enabled: boolean;
  scope: "all_vehicles" | "selected_vehicles" | "all_garages" | "selected_garages";
  selectedVehicleIds: string[];
  selectedGarageIds: string[];
}

const notificationsFile = path.join(process.cwd(), "src/data/notifications.json");

async function writeNotifications(list: NotificationTask[]) {
  await fs.mkdir(path.dirname(notificationsFile), { recursive: true });
  await fs.writeFile(notificationsFile, JSON.stringify(list, null, 2), "utf8");
}

export async function getNotifications(): Promise<NotificationTask[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map((item) => fromNotificationRecord(item as Record<string, unknown>));
        }
      }
    } catch {
      // fall back to the local file store below
    }
  }

  try {
    const raw = await fs.readFile(notificationsFile, "utf8");
    const data = JSON.parse(raw) as NotificationTask[];
    return Array.isArray(data) ? data : [];
  } catch {
    await writeNotifications([]);
    return [];
  }
}

export async function createNotification(task: Partial<NotificationTask>) {
  const item: NotificationTask = {
    id: randomUUID(),
    vehicleId: task.vehicleId,
    garageId: task.garageId,
    type: task.type || "maintenance",
    title: task.title || "Reminder",
    dueDate: task.dueDate || new Date().toISOString(),
    status: task.status || "upcoming",
    enabled: task.enabled ?? true,
    completed: task.completed ?? false,
    lastSentDate: task.lastSentDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("notifications").insert([toNotificationRecord(item)]).select().single();
        if (!error && data) {
          return fromNotificationRecord(data as Record<string, unknown>);
        }
      }
    } catch {
      // fall back to the local file store below
    }
  }

  const list = await getNotifications();
  list.unshift(item);
  await writeNotifications(list);
  return item;
}

export async function updateNotification(id: string, changes: Partial<NotificationTask>) {
  const list = await getNotifications();
  const idx = list.findIndex((item) => item.id === id);
  if (idx < 0) throw new Error("Notification not found");
  const updated = { ...list[idx], ...changes, updatedAt: new Date().toISOString() } as NotificationTask;
  if (updated.completed) {
    updated.enabled = false;
    updated.status = "completed";
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("notifications").update(toNotificationRecord(updated)).eq("id", id).select().single();
        if (!error && data) {
          return fromNotificationRecord(data as Record<string, unknown>);
        }
      }
    } catch {
      // fall back to the local file store below
    }
  }

  list[idx] = updated;
  await writeNotifications(list);
  return updated;
}

export async function getNotificationSummary() {
  const list = await getNotifications();
  const vehicles = await getVehicles();
  const derivedReminders: NotificationTask[] = vehicles.flatMap((vehicle) => {
    const entries: NotificationTask[] = [];
    const createdAt = vehicle.updatedAt || vehicle.createdAt || new Date().toISOString();

    if (vehicle.nextMaintenanceDate && vehicle.maintenanceReminderEnabled) {
      entries.push({
        id: `derived-maintenance-${vehicle.id}`,
        vehicleId: vehicle.id,
        type: "maintenance",
        title: `Next maintenance for ${vehicle.name}`,
        dueDate: vehicle.nextMaintenanceDate,
        status: "upcoming",
        enabled: true,
        completed: false,
        readonly: true,
        createdAt,
        updatedAt: createdAt,
      });
    }

    if (vehicle.nextProtectionDate && vehicle.protectionReminderEnabled) {
      entries.push({
        id: `derived-protection-${vehicle.id}`,
        vehicleId: vehicle.id,
        type: "protection",
        title: `Next protection renewal for ${vehicle.name}`,
        dueDate: vehicle.nextProtectionDate,
        status: "upcoming",
        enabled: true,
        completed: false,
        readonly: true,
        createdAt,
        updatedAt: createdAt,
      });
    }

    if (vehicle.nextLicenceDate && vehicle.licenceReminderEnabled) {
      entries.push({
        id: `derived-licence-${vehicle.id}`,
        vehicleId: vehicle.id,
        type: "licence",
        title: `Next licence renewal for ${vehicle.name}`,
        dueDate: vehicle.nextLicenceDate,
        status: "upcoming",
        enabled: true,
        completed: false,
        readonly: true,
        createdAt,
        updatedAt: createdAt,
      });
    }

    return entries;
  });

  const now = new Date();
  return [...derivedReminders, ...list].map((item) => {
    const due = new Date(item.dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let status: NotificationStatus = "upcoming";
    if (item.completed) status = "completed";
    else if (diffDays <= 0) status = "overdue";
    else if (diffDays <= 7) status = "due_soon";
    return { ...item, status, diffDays };
  });
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  return {
    enabled: true,
    scope: "all_vehicles",
    selectedVehicleIds: [],
    selectedGarageIds: [],
  };
}

export async function updateNotificationSettings(settings: Partial<NotificationSettings>) {
  return { ...(await getNotificationSettings()), ...settings };
}

export function getReminderSchedule(dueDate: string) {
  const due = new Date(dueDate);
  const start = new Date(due);
  start.setDate(start.getDate() - 30);
  return { firstSmsAt: start, intervalMs: 7 * 24 * 60 * 60 * 1000 };
}
