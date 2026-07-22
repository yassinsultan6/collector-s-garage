"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { mergePhotoUrls } from "@/lib/vehicle-photo-utils";

type VehicleForm = {
  name: string;
  make: string;
  model: string;
  type: string;
  customType: string;
  isPublic: boolean;
  status: string;
  year: string;
  vin: string;
  licensePlateNumber: string;
  engineNumber: string;
  color: string;
  mileage: string;
  location: string;
  garage: string;
  specs: string;
  photos: string;
  documents: string;
  maintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceReminderEnabled: boolean;
  protectionDate: string;
  nextProtectionDate: string;
  protectionReminderEnabled: boolean;
  licenceDate: string;
  nextLicenceDate: string;
  licenceReminderEnabled: boolean;
};

const emptyForm: VehicleForm = {
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
  documents: "",
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

export default function NewVehiclePage() {
  const router = useRouter();
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((s) => ({ ...s, [name]: checked }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

      setForm((current) => ({ ...current, photos: mergePhotoUrls(current.photos, uploadedUrls) }));
    } catch (uploadError) {
      setPhotoUploadError(uploadError instanceof Error ? uploadError.message : "Unable to upload photo");
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  };

  const save = async () => {
    if (!form.name.trim() || !form.type.trim()) {
      setError("Vehicle name and category are required");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const obj = (await res.json()) as { id: string };
        router.push(`/vehicles/${obj.id}`);
        return;
      }

      const failure = (await res.json().catch(() => ({}))) as { error?: string };
      setError(failure.error || "Failed to save");
      setSaving(false);
    } catch (e) {
      setError("Failed to save");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Add Vehicle</h1>
      </div>

      {error ? <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input name="name" value={form.name} placeholder="Vehicle name" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" required />
        <input name="type" value={form.type} placeholder="Category" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" required />
        <input name="customType" value={form.customType} placeholder="Custom label" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <select name="status" value={form.status} onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200">
          <option value="active">Active</option>
          <option value="stored">Stored</option>
          <option value="restoration">Restoration</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <label className="flex items-center gap-2 rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-300">
          <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleToggle} />
          Show on public landing page
        </label>
        <input name="make" value={form.make} placeholder="Make" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input name="model" value={form.model} placeholder="Model" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input name="year" value={form.year} placeholder="Manufacture year" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input name="vin" value={form.vin} placeholder="VIN" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input name="licensePlateNumber" value={form.licensePlateNumber} placeholder="License plate" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input name="engineNumber" value={form.engineNumber} placeholder="Engine number" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input name="color" value={form.color} placeholder="Color" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input name="mileage" value={form.mileage} placeholder="Mileage" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input name="location" value={form.location} placeholder="Location" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input name="garage" value={form.garage} placeholder="Garage" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <textarea name="specs" value={form.specs} placeholder="Specifications" onChange={handle} className="col-span-1 rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200 sm:col-span-2" />
        <div className="col-span-1 rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-300 sm:col-span-2">
          <label className="mb-2 block text-sm text-slate-200">Upload vehicle photo(s)</label>
          <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="block w-full text-sm text-slate-300" />
          {uploadingPhoto ? <p className="mt-2 text-xs text-amber-300">Uploading photo…</p> : null}
          {photoUploadError ? <p className="mt-2 text-xs text-rose-300">{photoUploadError}</p> : null}
        </div>
        <textarea name="photos" value={form.photos} placeholder="Photo URLs (one per line)" onChange={handle} className="col-span-1 rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200 sm:col-span-2" />
        <textarea name="documents" value={form.documents} placeholder="Documents" onChange={handle} className="col-span-1 rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200 sm:col-span-2" />

        <input type="date" name="maintenanceDate" value={form.maintenanceDate} onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input type="date" name="nextMaintenanceDate" value={form.nextMaintenanceDate} onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <label className="col-span-1 flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
          <input type="checkbox" name="maintenanceReminderEnabled" checked={form.maintenanceReminderEnabled} onChange={handleToggle} />
          Enable next maintenance reminder
        </label>

        <input type="date" name="protectionDate" value={form.protectionDate} onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input type="date" name="nextProtectionDate" value={form.nextProtectionDate} onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <label className="col-span-1 flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
          <input type="checkbox" name="protectionReminderEnabled" checked={form.protectionReminderEnabled} onChange={handleToggle} />
          Enable next protection reminder
        </label>

        <input type="date" name="licenceDate" value={form.licenceDate} onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input type="date" name="nextLicenceDate" value={form.nextLicenceDate} onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <label className="col-span-1 flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
          <input type="checkbox" name="licenceReminderEnabled" checked={form.licenceReminderEnabled} onChange={handleToggle} />
          Enable next licence reminder
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900">{saving ? "Saving..." : "Save"}</button>
      </div>
    </div>
  );
}
