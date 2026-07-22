"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { AdminRole, AdminSettings, AdminUser, DocumentRequirement, KeyLocationItem, NotificationRuleSettings, VehicleTypeItem } from "@/lib/admin-store";
import type { Garage, GarageSpot } from "@/lib/garage-store";
import type { Vehicle } from "@/lib/vehicle-store";
import { mergePhotoUrls, splitPhotoUrls } from "@/lib/vehicle-photo-utils";

type AdminSection =
  | "overview"
  | "vehicles"
  | "vehicle-types"
  | "garages"
  | "parking-spots"
  | "key-locations"
  | "users"
  | "notifications";

const sectionCards: Array<{ key: AdminSection; label: string; description: string }> = [
  { key: "overview", label: "Overview", description: "At-a-glance admin control" },
  { key: "vehicles", label: "Vehicles", description: "Create and review vehicle records" },
  { key: "vehicle-types", label: "Vehicle Types", description: "Custom categories for the collection" },
  { key: "garages", label: "Garages", description: "Manage protected storage sites" },
  { key: "parking-spots", label: "Parking Spots", description: "Assign spaces inside garages" },
  { key: "key-locations", label: "Key Locations", description: "Track secure key storage" },
  { key: "users", label: "Users", description: "Grant access and roles" },
  { key: "notifications", label: "Notifications", description: "Enable reminder workflows" },
];

const emptyVehicleForm = {
  name: "",
  make: "",
  model: "",
  type: "",
  customType: "",
  isPublic: false,
  status: "active",
  year: "",
  vin: "",
  licensePlateNumber: "",
  engineNumber: "",
  color: "",
  mileage: "",
  location: "",
  garage: "",
  specs: "",
  photos: "",
  maintenanceRecords: "",
  licenseInfo: "",
  restorationHistory: "",
  tuningDetails: "",
  spareKeys: "",
  documents: "",
  comments: "",
  timeline: "",
  maintenanceDate: "",
  nextMaintenanceDate: "",
  maintenanceReminderEnabled: false,
  protectionDate: "",
  nextProtectionDate: "",
  protectionReminderEnabled: false,
  licenceDate: "",
  nextLicenceDate: "",
  licenceReminderEnabled: false,
};

const emptyGarageForm = {
  name: "",
  address: "",
  capacity: "",
  description: "",
};

const emptySpotForm = {
  garageId: "",
  spotNumber: "",
  description: "",
};

const emptyVehicleTypeForm = {
  name: "",
  description: "",
  enabled: true,
};

const emptyKeyLocationForm = {
  name: "",
  description: "",
  enabled: true,
};

const emptyUserForm = {
  name: "",
  username: "",
  email: "",
  role: "viewer",
  password: "",
  active: true,
  permissions: "",
};

const emptyDocumentForm = {
  name: "",
  category: "",
  required: true,
  enabled: true,
};

export default function AdminPage() {
  const [sessionRole, setSessionRole] = useState<AdminRole | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [spots, setSpots] = useState<GarageSpot[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicleForm);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [garageForm, setGarageForm] = useState(emptyGarageForm);
  const [spotForm, setSpotForm] = useState(emptySpotForm);
  const [vehicleTypeForm, setVehicleTypeForm] = useState(emptyVehicleTypeForm);
  const [editingVehicleTypeId, setEditingVehicleTypeId] = useState<string | null>(null);
  const [keyLocationForm, setKeyLocationForm] = useState(emptyKeyLocationForm);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [documentForm, setDocumentForm] = useState(emptyDocumentForm);
  const [permissionInput, setPermissionInput] = useState("");
  const [notificationForm, setNotificationForm] = useState<NotificationRuleSettings>({
    enabled: true,
    scope: "all_vehicles",
    selectedVehicleIds: [],
    selectedGarageIds: [],
  });

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionResponse, adminResponse, vehiclesResponse, garagesResponse, spotsResponse] = await Promise.all([
        fetch("/api/auth/session"),
        fetch("/api/admin"),
        fetch("/api/vehicles"),
        fetch("/api/garages"),
        fetch("/api/garage-spots"),
      ]);

      if (!sessionResponse.ok || !adminResponse.ok || !vehiclesResponse.ok || !garagesResponse.ok || !spotsResponse.ok) {
        throw new Error("Unable to load admin workspace");
      }

      const nextSession = (await sessionResponse.json()) as { user?: { role?: AdminRole } | null };
      setSessionRole(nextSession.user?.role ?? null);

      const nextSettings = (await adminResponse.json()) as AdminSettings;
      setSettings(nextSettings);
      setVehicles((await vehiclesResponse.json()) as Vehicle[]);
      setGarages((await garagesResponse.json()) as Garage[]);
      setSpots((await spotsResponse.json()) as GarageSpot[]);
      setNotificationForm(nextSettings.notifications);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load admin workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshData();
  }, []);

  const runAction = async (action: string, payload?: unknown, id?: string) => {
    const response = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload, id }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error || "Action failed");
      return;
    }

    setMessage("Settings updated");
    await refreshData();
  };

  const handleVehiclePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setUploadingPhoto(true);
    setPhotoUploadError(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/vehicles/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const result = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!response.ok || !result.url) {
          throw new Error(result.error || "Unable to upload photo");
        }

        uploadedUrls.push(result.url);
      }

      setVehicleForm((value) => ({ ...value, photos: mergePhotoUrls(value.photos, uploadedUrls) }));
      setMessage("Photo uploaded successfully");
    } catch (uploadError) {
      setPhotoUploadError(uploadError instanceof Error ? uploadError.message : "Unable to upload photo");
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  };

  const submitVehicle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (editingVehicleId) {
      const response = await fetch("/api/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingVehicleId, ...vehicleForm }),
      });
      if (response.ok) {
        setMessage("Vehicle updated");
        setVehicleForm(emptyVehicleForm);
        setEditingVehicleId(null);
        await refreshData();
      }
    } else {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleForm),
      });
      if (response.ok) {
        setMessage("Vehicle added to the collection");
        setVehicleForm(emptyVehicleForm);
        await refreshData();
      }
    }
  };

  const startEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setVehicleForm({
      name: vehicle.name ?? "",
      make: vehicle.make ?? "",
      model: vehicle.model ?? "",
      type: vehicle.type ?? "",
      customType: vehicle.customType ?? "",
      isPublic: vehicle.isPublic ?? false,
      status: vehicle.status ?? "active",
      year: vehicle.year ?? "",
      vin: vehicle.vin ?? "",
      licensePlateNumber: vehicle.licensePlateNumber ?? "",
      engineNumber: vehicle.engineNumber ?? "",
      color: vehicle.color ?? "",
      mileage: vehicle.mileage ?? "",
      location: vehicle.location ?? "",
      garage: vehicle.garage ?? "",
      specs: vehicle.specs ?? "",
      photos: vehicle.photos ?? "",
      maintenanceRecords: vehicle.maintenanceRecords ?? "",
      licenseInfo: vehicle.licenseInfo ?? "",
      restorationHistory: vehicle.restorationHistory ?? "",
      tuningDetails: vehicle.tuningDetails ?? "",
      spareKeys: vehicle.spareKeys ?? "",
      documents: vehicle.documents ?? "",
      comments: vehicle.comments ?? "",
      timeline: vehicle.timeline ?? "",
      maintenanceDate: vehicle.maintenanceDate ?? "",
      nextMaintenanceDate: vehicle.nextMaintenanceDate ?? "",
      maintenanceReminderEnabled: vehicle.maintenanceReminderEnabled ?? false,
      protectionDate: vehicle.protectionDate ?? "",
      nextProtectionDate: vehicle.nextProtectionDate ?? "",
      protectionReminderEnabled: vehicle.protectionReminderEnabled ?? false,
      licenceDate: vehicle.licenceDate ?? "",
      nextLicenceDate: vehicle.nextLicenceDate ?? "",
      licenceReminderEnabled: vehicle.licenceReminderEnabled ?? false,
    });
  };

  const deleteVehicleById = async (id: string) => {
    if (!confirm("Delete this vehicle? This cannot be undone.")) return;
    const response = await fetch(`/api/vehicles?id=${id}`, { method: "DELETE", credentials: "include" });
    if (response.ok) {
      setMessage("Vehicle deleted");
      if (editingVehicleId === id) {
        setEditingVehicleId(null);
        setVehicleForm(emptyVehicleForm);
      }
      await refreshData();
    }
  };

  const submitGarage = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/garages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: garageForm.name,
        address: garageForm.address,
        capacity: Number(garageForm.capacity) || undefined,
        description: garageForm.description,
      }),
    });

    if (response.ok) {
      setMessage("Garage added");
      setGarageForm(emptyGarageForm);
      await refreshData();
    }
  };

  const submitSpot = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/garage-spots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(spotForm),
    });

    if (response.ok) {
      setMessage("Parking spot created");
      setSpotForm(emptySpotForm);
      await refreshData();
    }
  };

  const submitVehicleType = async (event: React.FormEvent) => {
    event.preventDefault();
    if (editingVehicleTypeId) {
      await runAction("updateVehicleType", { name: vehicleTypeForm.name, description: vehicleTypeForm.description, enabled: vehicleTypeForm.enabled }, editingVehicleTypeId);
      setEditingVehicleTypeId(null);
      setVehicleTypeForm(emptyVehicleTypeForm);
      return;
    }

    await runAction("createVehicleType", { name: vehicleTypeForm.name, description: vehicleTypeForm.description, enabled: vehicleTypeForm.enabled });
    setVehicleTypeForm(emptyVehicleTypeForm);
  };

  const submitKeyLocation = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction("createKeyLocation", { name: keyLocationForm.name, description: keyLocationForm.description, enabled: keyLocationForm.enabled });
    setKeyLocationForm(emptyKeyLocationForm);
  };

  const submitUser = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction("createUser", {
      name: userForm.name,
      username: userForm.username,
      email: userForm.email,
      role: userForm.role,
      password: userForm.password,
      active: userForm.active,
      permissions: userForm.permissions.split(",").map((value) => value.trim()).filter(Boolean),
    });
    setUserForm(emptyUserForm);
  };

  const submitDocument = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction("createDocument", { name: documentForm.name, category: documentForm.category, required: documentForm.required, enabled: documentForm.enabled });
    setDocumentForm(emptyDocumentForm);
  };

  const addPermission = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!permissionInput.trim()) return;
    await runAction("createPermission", { name: permissionInput });
    setPermissionInput("");
  };

  const saveNotificationSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction("updateNotificationSettings", notificationForm);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const query = vehicleSearch.trim().toLowerCase();
    if (!query) return true;

    return [
      vehicle.name,
      vehicle.make,
      vehicle.model,
      vehicle.type,
      vehicle.customType,
      vehicle.status,
      vehicle.year,
      vehicle.vin,
      vehicle.licensePlateNumber,
      vehicle.engineNumber,
      vehicle.color,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc_0%,_#fff7ed_100%)] px-4 py-8 text-slate-700 sm:px-6 lg:px-8">
        <LoadingState title="Loading admin workspace" description="Preparing your collection controls and reminder settings." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc_0%,_#fff7ed_100%)] px-4 py-8 text-slate-700 sm:px-6 lg:px-8">
        <ErrorState title="Admin workspace unavailable" description={error} action={<button type="button" onClick={() => void refreshData()} className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white">Retry</button>} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc_0%,_#fff7ed_100%)] text-slate-800">
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Yehia Rashdan</p>
            <h1 className="text-3xl font-semibold text-slate-900">Admin dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Manage vehicles, reminders, and collection details from one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Back to collection</Link>
          </div>
        </div>

        {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sectionCards.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveSection(section.key)}
              className={`rounded-2xl border p-4 text-left transition ${activeSection === section.key ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <div className="text-sm font-semibold text-slate-900">{section.label}</div>
              <div className="mt-2 text-sm text-slate-600">{section.description}</div>
            </button>
          ))}
        </section>

        {activeSection === "overview" && settings ? (
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">System overview</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-sm text-slate-400">Vehicles</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{vehicles.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-sm text-slate-400">Garages</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{garages.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-sm text-slate-400">Parking spots</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{spots.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-sm text-slate-400">Active notifications</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{settings.notifications.enabled ? "On" : "Off"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">Quick actions</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">Custom vehicle types: {settings.vehicleTypes.length}</div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">Key locations: {settings.keyLocations.length}</div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">Users with access: {settings.users.length}</div>
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === "vehicles" ? (
          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={submitVehicle} className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">{editingVehicleId ? "Edit vehicle" : "Add vehicle"}</h2>
                {editingVehicleId ? (
                  <button type="button" onClick={() => { setEditingVehicleId(null); setVehicleForm(emptyVehicleForm); }} className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1.5 text-sm text-slate-300">Cancel edit</button>
                ) : null}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Vehicle name" value={vehicleForm.name} onChange={(event) => setVehicleForm((value) => ({ ...value, name: event.target.value }))} required />
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Make" value={vehicleForm.make} onChange={(event) => setVehicleForm((value) => ({ ...value, make: event.target.value }))} />
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Model" value={vehicleForm.model} onChange={(event) => setVehicleForm((value) => ({ ...value, model: event.target.value }))} />
                <select className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" value={vehicleForm.type} onChange={(event) => setVehicleForm((value) => ({ ...value, type: event.target.value }))} required>
                  <option value="">Select category</option>
                  {settings?.vehicleTypes.filter((item) => item.enabled).map((item) => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
                </select>
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Custom label (optional)" value={vehicleForm.customType} onChange={(event) => setVehicleForm((value) => ({ ...value, customType: event.target.value }))} />
                <select className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" value={vehicleForm.status} onChange={(event) => setVehicleForm((value) => ({ ...value, status: event.target.value }))}>
                  <option value="active">Active</option>
                  <option value="stored">Stored</option>
                  <option value="restoration">Restoration</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
                  <input type="checkbox" checked={vehicleForm.isPublic} onChange={(event) => setVehicleForm((value) => ({ ...value, isPublic: event.target.checked }))} />
                  Show on public landing page
                </label>
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Manufacture year" value={vehicleForm.year} onChange={(event) => setVehicleForm((value) => ({ ...value, year: event.target.value }))} />
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="VIN" value={vehicleForm.vin} onChange={(event) => setVehicleForm((value) => ({ ...value, vin: event.target.value }))} />
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="License plate number" value={vehicleForm.licensePlateNumber} onChange={(event) => setVehicleForm((value) => ({ ...value, licensePlateNumber: event.target.value }))} />
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Engine number" value={vehicleForm.engineNumber} onChange={(event) => setVehicleForm((value) => ({ ...value, engineNumber: event.target.value }))} />
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Color" value={vehicleForm.color} onChange={(event) => setVehicleForm((value) => ({ ...value, color: event.target.value }))} />
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Mileage" value={vehicleForm.mileage} onChange={(event) => setVehicleForm((value) => ({ ...value, mileage: event.target.value }))} />
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Location" value={vehicleForm.location} onChange={(event) => setVehicleForm((value) => ({ ...value, location: event.target.value }))} />
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Garage" value={vehicleForm.garage} onChange={(event) => setVehicleForm((value) => ({ ...value, garage: event.target.value }))} />
                <textarea className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 md:col-span-2" placeholder="Specifications" value={vehicleForm.specs} onChange={(event) => setVehicleForm((value) => ({ ...value, specs: event.target.value }))} />
                <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-300 md:col-span-2">
                  <label className="mb-2 block font-medium text-slate-100">Upload vehicle photo(s)</label>
                  <input type="file" multiple accept="image/*" onChange={handleVehiclePhotoUpload} className="block w-full text-sm text-slate-300" />
                  {uploadingPhoto ? <p className="mt-2 text-xs text-amber-300">Uploading photo…</p> : null}
                  {photoUploadError ? <p className="mt-2 text-xs text-rose-300">{photoUploadError}</p> : null}
                </div>
                <textarea className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 md:col-span-2" placeholder="Photo URLs (one per line)" value={vehicleForm.photos} onChange={(event) => setVehicleForm((value) => ({ ...value, photos: event.target.value }))} />
                <textarea className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 md:col-span-2" placeholder="License details" value={vehicleForm.licenseInfo} onChange={(event) => setVehicleForm((value) => ({ ...value, licenseInfo: event.target.value }))} />
                <textarea className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 md:col-span-2" placeholder="Maintenance records" value={vehicleForm.maintenanceRecords} onChange={(event) => setVehicleForm((value) => ({ ...value, maintenanceRecords: event.target.value }))} />
                <textarea className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 md:col-span-2" placeholder="Restoration history" value={vehicleForm.restorationHistory} onChange={(event) => setVehicleForm((value) => ({ ...value, restorationHistory: event.target.value }))} />
                <textarea className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 md:col-span-2" placeholder="Tuning details" value={vehicleForm.tuningDetails} onChange={(event) => setVehicleForm((value) => ({ ...value, tuningDetails: event.target.value }))} />
                <textarea className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 md:col-span-2" placeholder="Spare keys notes" value={vehicleForm.spareKeys} onChange={(event) => setVehicleForm((value) => ({ ...value, spareKeys: event.target.value }))} />
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:col-span-2">
                  <h3 className="text-sm font-semibold text-white">Maintenance</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">Deadline date</label>
                      <input type="date" className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" value={vehicleForm.nextMaintenanceDate} onChange={(event) => setVehicleForm((value) => ({ ...value, nextMaintenanceDate: event.target.value }))} />
                    </div>
                    <label className="flex items-center gap-2 self-end text-sm text-slate-300">
                      <input type="checkbox" checked={vehicleForm.maintenanceReminderEnabled} onChange={(event) => setVehicleForm((value) => ({ ...value, maintenanceReminderEnabled: event.target.checked }))} />
                      Enable reminder
                    </label>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:col-span-2">
                  <h3 className="text-sm font-semibold text-white">Protection</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">Deadline date</label>
                      <input type="date" className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" value={vehicleForm.nextProtectionDate} onChange={(event) => setVehicleForm((value) => ({ ...value, nextProtectionDate: event.target.value }))} />
                    </div>
                    <label className="flex items-center gap-2 self-end text-sm text-slate-300">
                      <input type="checkbox" checked={vehicleForm.protectionReminderEnabled} onChange={(event) => setVehicleForm((value) => ({ ...value, protectionReminderEnabled: event.target.checked }))} />
                      Enable reminder
                    </label>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:col-span-2">
                  <h3 className="text-sm font-semibold text-white">Licence</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">Deadline date</label>
                      <input type="date" className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" value={vehicleForm.nextLicenceDate} onChange={(event) => setVehicleForm((value) => ({ ...value, nextLicenceDate: event.target.value }))} />
                    </div>
                    <label className="flex items-center gap-2 self-end text-sm text-slate-300">
                      <input type="checkbox" checked={vehicleForm.licenceReminderEnabled} onChange={(event) => setVehicleForm((value) => ({ ...value, licenceReminderEnabled: event.target.checked }))} />
                      Enable reminder
                    </label>
                  </div>
                </div>
                <textarea className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 md:col-span-2" placeholder="Documents" value={vehicleForm.documents} onChange={(event) => setVehicleForm((value) => ({ ...value, documents: event.target.value }))} />
                <textarea className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 md:col-span-2" placeholder="Comments" value={vehicleForm.comments} onChange={(event) => setVehicleForm((value) => ({ ...value, comments: event.target.value }))} />
                <textarea className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 md:col-span-2" placeholder="History timeline" value={vehicleForm.timeline} onChange={(event) => setVehicleForm((value) => ({ ...value, timeline: event.target.value }))} />
              </div>
              <button type="submit" className="mt-4 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950">{editingVehicleId ? "Update vehicle" : "Save vehicle"}</button>
            </form>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-white">Current vehicles</h2>
                <input
                  value={vehicleSearch}
                  onChange={(event) => setVehicleSearch(event.target.value)}
                  placeholder="Search by name, model, licence plate…"
                  className="rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>
              <div className="mt-4 space-y-3">
                {filteredVehicles.length === 0 ? (
                  <EmptyState title="No vehicles yet" description="Create the first vehicle profile to start managing the collection." />
                ) : filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} className={`rounded-2xl border bg-slate-900/60 p-4 transition ${editingVehicleId === vehicle.id ? "border-amber-400/50" : "border-white/10"}`}>
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-800/70">
                        {splitPhotoUrls(vehicle.photos)[0] ? <img src={splitPhotoUrls(vehicle.photos)[0]} alt={vehicle.name} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white">{vehicle.name}</div>
                        <div className="mt-1 text-sm text-slate-400">{vehicle.type || vehicle.customType || "Custom profile"}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{vehicle.status || "active"}</div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <button type="button" onClick={() => startEditVehicle(vehicle)} className="rounded-lg bg-amber-400/20 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-400/30">Edit</button>
                        <button type="button" onClick={() => void deleteVehicleById(vehicle.id)} className="rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/30">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === "vehicle-types" && settings ? (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <form onSubmit={submitVehicleType} className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">{editingVehicleTypeId ? "Edit vehicle type" : "Create vehicle type"}</h2>
              <div className="mt-4 space-y-3">
                <input className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Vehicle type" value={vehicleTypeForm.name} onChange={(event) => setVehicleTypeForm((value) => ({ ...value, name: event.target.value }))} required />
                <textarea className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Description" value={vehicleTypeForm.description} onChange={(event) => setVehicleTypeForm((value) => ({ ...value, description: event.target.value }))} />
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={vehicleTypeForm.enabled} onChange={(event) => setVehicleTypeForm((value) => ({ ...value, enabled: event.target.checked }))} />
                  Enabled
                </label>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button type="submit" className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950">
                  {editingVehicleTypeId ? "Update type" : "Save type"}
                </button>
                {editingVehicleTypeId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVehicleTypeId(null);
                      setVehicleTypeForm(emptyVehicleTypeForm);
                    }}
                    className="rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 text-sm text-slate-200"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">Managed vehicle types</h2>
              <div className="mt-4 space-y-3">
                {settings.vehicleTypes.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div>
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-sm text-slate-400">{item.description || "No description"}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{item.enabled ? "Enabled" : "Disabled"}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVehicleTypeId(item.id);
                          setVehicleTypeForm({ name: item.name, description: item.description || "", enabled: item.enabled });
                        }}
                        className="text-sm text-amber-300"
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => void runAction("deleteVehicleType", undefined, item.id)} className="text-sm text-rose-300">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === "garages" ? (
          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={submitGarage} className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">Add garage</h2>
              <div className="mt-4 grid gap-3">
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Garage name" value={garageForm.name} onChange={(event) => setGarageForm((value) => ({ ...value, name: event.target.value }))} required />
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Address" value={garageForm.address} onChange={(event) => setGarageForm((value) => ({ ...value, address: event.target.value }))} />
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Capacity" value={garageForm.capacity} onChange={(event) => setGarageForm((value) => ({ ...value, capacity: event.target.value }))} />
                <textarea className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Description" value={garageForm.description} onChange={(event) => setGarageForm((value) => ({ ...value, description: event.target.value }))} />
              </div>
              <button type="submit" className="mt-4 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950">Save garage</button>
            </form>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">Existing garages</h2>
              <div className="mt-4 space-y-3">
                {garages.length === 0 ? (
                  <EmptyState title="No garages yet" description="Add a garage to organize storage, parking spots, and display rooms." />
                ) : garages.map((garage) => (
                  <div key={garage.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="font-semibold text-white">{garage.name || "Unnamed garage"}</div>
                    <div className="text-sm text-slate-400">{garage.address || "No address"}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === "parking-spots" ? (
          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={submitSpot} className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">Create parking spot</h2>
              <div className="mt-4 grid gap-3">
                <select className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" value={spotForm.garageId} onChange={(event) => setSpotForm((value) => ({ ...value, garageId: event.target.value }))} required>
                  <option value="">Select garage</option>
                  {garages.map((garage) => (
                    <option key={garage.id} value={garage.id}>{garage.name || garage.id}</option>
                  ))}
                </select>
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Spot number" value={spotForm.spotNumber} onChange={(event) => setSpotForm((value) => ({ ...value, spotNumber: event.target.value }))} required />
                <textarea className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Description" value={spotForm.description} onChange={(event) => setSpotForm((value) => ({ ...value, description: event.target.value }))} />
              </div>
              <button type="submit" className="mt-4 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950">Save spot</button>
            </form>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">Parking spots</h2>
              <div className="mt-4 space-y-3">
                {spots.length === 0 ? (
                  <EmptyState title="No parking spots yet" description="Create spots to map the occupancy of each garage." />
                ) : spots.map((spot) => (
                  <div key={spot.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="font-semibold text-white">{spot.spotNumber || "Spot"}</div>
                    <div className="text-sm text-slate-400">Garage {spot.garageId}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === "key-locations" && settings ? (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <form onSubmit={submitKeyLocation} className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">Create key location</h2>
              <div className="mt-4 space-y-3">
                <input className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Location name" value={keyLocationForm.name} onChange={(event) => setKeyLocationForm((value) => ({ ...value, name: event.target.value }))} required />
                <textarea className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Description" value={keyLocationForm.description} onChange={(event) => setKeyLocationForm((value) => ({ ...value, description: event.target.value }))} />
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={keyLocationForm.enabled} onChange={(event) => setKeyLocationForm((value) => ({ ...value, enabled: event.target.checked }))} />
                  Enabled
                </label>
              </div>
              <button type="submit" className="mt-4 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950">Save location</button>
            </form>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">Key locations</h2>
              <div className="mt-4 space-y-3">
                {settings.keyLocations.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div>
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-sm text-slate-400">{item.description || "No description"}</div>
                    </div>
                    <button type="button" onClick={() => void runAction("deleteKeyLocation", undefined, item.id)} className="text-sm text-rose-300">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === "users" && settings ? (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <form onSubmit={submitUser} className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">Add user</h2>
              <div className="mt-4 grid gap-3">
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Name" value={userForm.name} onChange={(event) => setUserForm((value) => ({ ...value, name: event.target.value }))} required />
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Username" value={userForm.username} onChange={(event) => setUserForm((value) => ({ ...value, username: event.target.value }))} required />
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Email" value={userForm.email} onChange={(event) => setUserForm((value) => ({ ...value, email: event.target.value }))} required />
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Password" type="password" value={userForm.password} onChange={(event) => setUserForm((value) => ({ ...value, password: event.target.value }))} required />
                <select className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" value={userForm.role} onChange={(event) => setUserForm((value) => ({ ...value, role: event.target.value }))}>
                  {sessionRole === "admin" ? <option value="admin">Admin</option> : null}
                  {sessionRole === "admin" ? <option value="co-admin">Co-admin</option> : null}
                  <option value="viewer">Viewer</option>
                </select>
                <input className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" placeholder="Permissions (comma separated)" value={userForm.permissions} onChange={(event) => setUserForm((value) => ({ ...value, permissions: event.target.value }))} />
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={userForm.active} onChange={(event) => setUserForm((value) => ({ ...value, active: event.target.checked }))} />
                  Active
                </label>
              </div>
              <button type="submit" className="mt-4 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950">Save user</button>
            </form>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">Access users</h2>
              <div className="mt-4 space-y-3">
                {settings.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div>
                      <div className="font-semibold text-white">{user.name}</div>
                      <div className="text-sm text-slate-400">{user.username} • {user.email} • {user.role}</div>
                    </div>
                    <button type="button" onClick={() => void runAction("deleteUser", undefined, user.id)} className="text-sm text-rose-300" disabled={sessionRole !== "admin" && user.role !== "viewer"}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === "notifications" && settings ? (
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
            <h2 className="text-xl font-semibold text-white">Notification controls</h2>
            <form onSubmit={saveNotificationSettings} className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-300">
                <input type="checkbox" checked={notificationForm.enabled} onChange={(event) => setNotificationForm((value) => ({ ...value, enabled: event.target.checked }))} />
                Enable SMS reminders
              </label>
              <select className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100" value={notificationForm.scope} onChange={(event) => setNotificationForm((value) => ({ ...value, scope: event.target.value as NotificationRuleSettings["scope"] }))}>
                <option value="all_vehicles">All vehicles</option>
                <option value="selected_vehicles">Selected vehicles</option>
                <option value="all_garages">All garages</option>
                <option value="selected_garages">Selected garages</option>
              </select>
              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-400">Rules remain dynamic and update without code changes from this dashboard.</div>
              <button type="submit" className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950">Save notification settings</button>
            </form>
          </section>
        ) : null}

      </main>
    </div>
  );
}
