import type { AdminSettings } from "./admin-store";
import type { Garage, GarageSpot } from "./garage-store";
import type { NotificationTask } from "./notification-store";
import type { Vehicle } from "./vehicle-store";

export function toVehicleRecord(input: Partial<Vehicle> & { id?: string }) {
  return {
    id: input.id,
    name: input.name,
    make: input.make,
    model: input.model,
    type: input.type,
    custom_type: input.customType,
    is_public: input.isPublic,
    status: input.status,
    year: input.year,
    vin: input.vin,
    license_plate_number: input.licensePlateNumber,
    engine_number: input.engineNumber,
    color: input.color,
    mileage: input.mileage,
    location: input.location,
    garage: input.garage,
    specs: input.specs,
    photos: input.photos,
    maintenance_records: input.maintenanceRecords,
    maintenance_date: input.maintenanceDate,
    next_maintenance_date: input.nextMaintenanceDate,
    maintenance_reminder_enabled: input.maintenanceReminderEnabled,
    license_info: input.licenseInfo,
    licence_date: input.licenceDate,
    next_licence_date: input.nextLicenceDate,
    licence_reminder_enabled: input.licenceReminderEnabled,
    protection_date: input.protectionDate,
    next_protection_date: input.nextProtectionDate,
    protection_reminder_enabled: input.protectionReminderEnabled,
    restoration_history: input.restorationHistory,
    tuning_details: input.tuningDetails,
    spare_keys: input.spareKeys,
    documents: input.documents,
    comments: input.comments,
    timeline: input.timeline,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  };
}

export function fromVehicleRecord(record: Record<string, unknown>): Vehicle {
  return {
    id: String(record.id ?? ""),
    name: String(record.name ?? ""),
    make: record.make ? String(record.make) : undefined,
    model: record.model ? String(record.model) : undefined,
    type: String(record.type ?? ""),
    customType: record.custom_type ? String(record.custom_type) : undefined,
    isPublic: record.is_public === undefined ? false : Boolean(record.is_public),
    status: record.status ? String(record.status) : undefined,
    year: record.year ? String(record.year) : undefined,
    vin: record.vin ? String(record.vin) : undefined,
    licensePlateNumber: record.license_plate_number ? String(record.license_plate_number) : undefined,
    engineNumber: record.engine_number ? String(record.engine_number) : undefined,
    color: record.color ? String(record.color) : undefined,
    mileage: record.mileage ? String(record.mileage) : undefined,
    location: record.location ? String(record.location) : undefined,
    garage: record.garage ? String(record.garage) : undefined,
    specs: record.specs ? String(record.specs) : undefined,
    photos: record.photos ? String(record.photos) : undefined,
    maintenanceRecords: record.maintenance_records ? String(record.maintenance_records) : undefined,
    maintenanceDate: record.maintenance_date ? String(record.maintenance_date) : undefined,
    nextMaintenanceDate: record.next_maintenance_date ? String(record.next_maintenance_date) : undefined,
    maintenanceReminderEnabled: record.maintenance_reminder_enabled === undefined ? false : Boolean(record.maintenance_reminder_enabled),
    licenseInfo: record.license_info ? String(record.license_info) : undefined,
    licenceDate: record.licence_date ? String(record.licence_date) : undefined,
    nextLicenceDate: record.next_licence_date ? String(record.next_licence_date) : undefined,
    licenceReminderEnabled: record.licence_reminder_enabled === undefined ? false : Boolean(record.licence_reminder_enabled),
    protectionDate: record.protection_date ? String(record.protection_date) : undefined,
    nextProtectionDate: record.next_protection_date ? String(record.next_protection_date) : undefined,
    protectionReminderEnabled: record.protection_reminder_enabled === undefined ? false : Boolean(record.protection_reminder_enabled),
    restorationHistory: record.restoration_history ? String(record.restoration_history) : undefined,
    tuningDetails: record.tuning_details ? String(record.tuning_details) : undefined,
    spareKeys: record.spare_keys ? String(record.spare_keys) : undefined,
    documents: record.documents ? String(record.documents) : undefined,
    comments: record.comments ? String(record.comments) : undefined,
    timeline: record.timeline ? String(record.timeline) : undefined,
    createdAt: record.created_at ? String(record.created_at) : new Date().toISOString(),
    updatedAt: record.updated_at ? String(record.updated_at) : new Date().toISOString(),
  };
}

export function toGarageRecord(input: Partial<Garage> & { id?: string }) {
  return {
    id: input.id,
    name: input.name,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    capacity: input.capacity,
    description: input.description,
    image: input.image,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  };
}

export function fromGarageRecord(record: Record<string, unknown>): Garage {
  return {
    id: String(record.id ?? ""),
    name: record.name ? String(record.name) : undefined,
    address: record.address ? String(record.address) : undefined,
    latitude: record.latitude !== undefined ? Number(record.latitude) : undefined,
    longitude: record.longitude !== undefined ? Number(record.longitude) : undefined,
    capacity: record.capacity !== undefined ? Number(record.capacity) : undefined,
    description: record.description ? String(record.description) : undefined,
    image: record.image ? String(record.image) : undefined,
    createdAt: record.created_at ? String(record.created_at) : new Date().toISOString(),
    updatedAt: record.updated_at ? String(record.updated_at) : new Date().toISOString(),
  };
}

export function toGarageSpotRecord(input: Partial<GarageSpot> & { id?: string }) {
  return {
    id: input.id,
    garage_id: input.garageId,
    spot_number: input.spotNumber,
    description: input.description,
    vehicle_id: input.vehicleId ?? null,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  };
}

export function fromGarageSpotRecord(record: Record<string, unknown>): GarageSpot {
  return {
    id: String(record.id ?? ""),
    garageId: String(record.garage_id ?? ""),
    spotNumber: record.spot_number ? String(record.spot_number) : undefined,
    description: record.description ? String(record.description) : undefined,
    vehicleId: record.vehicle_id ? String(record.vehicle_id) : null,
    createdAt: record.created_at ? String(record.created_at) : new Date().toISOString(),
    updatedAt: record.updated_at ? String(record.updated_at) : new Date().toISOString(),
  };
}

export function toNotificationRecord(input: Partial<NotificationTask> & { id?: string }) {
  return {
    id: input.id,
    vehicle_id: input.vehicleId,
    garage_id: input.garageId,
    type: input.type,
    title: input.title,
    due_date: input.dueDate,
    status: input.status,
    enabled: input.enabled,
    completed: input.completed,
    last_sent_date: input.lastSentDate,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  };
}

export function fromNotificationRecord(record: Record<string, unknown>): NotificationTask {
  return {
    id: String(record.id ?? ""),
    vehicleId: record.vehicle_id ? String(record.vehicle_id) : undefined,
    garageId: record.garage_id ? String(record.garage_id) : undefined,
    type: (record.type as NotificationTask["type"]) || "maintenance",
    title: String(record.title ?? "Reminder"),
    dueDate: String(record.due_date ?? ""),
    status: (record.status as NotificationTask["status"]) || "upcoming",
    enabled: record.enabled === undefined ? true : Boolean(record.enabled),
    completed: record.completed === undefined ? false : Boolean(record.completed),
    lastSentDate: record.last_sent_date ? String(record.last_sent_date) : undefined,
    createdAt: record.created_at ? String(record.created_at) : new Date().toISOString(),
    updatedAt: record.updated_at ? String(record.updated_at) : new Date().toISOString(),
  };
}

export function toAdminSettingsRecord(settings: AdminSettings) {
  return {
    key: "collector_garage_admin",
    value: settings,
  };
}

export function fromAdminSettingsRecord(record: Record<string, unknown>): AdminSettings {
  return (record.value as AdminSettings) ?? ({} as AdminSettings);
}
