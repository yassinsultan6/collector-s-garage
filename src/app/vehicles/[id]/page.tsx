"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import type { KeyLocation, SpareKey } from "../../../lib/key-store";

type SessionResponse = {
  authenticated?: boolean;
  user?: {
    role?: "viewer" | "co-admin" | "admin";
  } | null;
};

type VehicleNarrativeForm = {
  timeline: string;
  comments: string;
  maintenanceRecords: string;
  restorationHistory: string;
  tuningDetails: string;
};

export default function VehicleDetailsPage() {
  const params = useParams() as Record<string, string | undefined>;
  const router = useRouter();
  const id = params.id;
  const [vehicle, setVehicle] = useState<Record<string, unknown> | null>(null);
  const [session, setSession] = useState<SessionResponse>({ authenticated: false, user: null });
  const [keys, setKeys] = useState<SpareKey[]>([]);
  const [locations, setLocations] = useState<KeyLocation[]>([]);
  const [locationForm, setLocationForm] = useState({ name: "", description: "" });
  const [form, setForm] = useState({ keyType: "Original Key", status: "Available", locationId: "", notes: "" });
  const [narrativeForm, setNarrativeForm] = useState<VehicleNarrativeForm>({
    timeline: "",
    comments: "",
    maintenanceRecords: "",
    restorationHistory: "",
    tuningDetails: "",
  });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSavingNarrative, setIsSavingNarrative] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const sessionRes = await fetch("/api/auth/session", { credentials: "include" });
        const nextSession = (await sessionRes.json()) as SessionResponse;
        setSession(nextSession);
        if (!nextSession.authenticated) {
          router.replace(`/vehicle/${id}`);
          return;
        }

        const [vehicleRes, keysRes, locationsRes] = await Promise.all([
          fetch("/api/vehicles"),
          fetch(`/api/spare-keys?vehicleId=${id}`),
          fetch("/api/key-locations"),
        ]);
        const vehicleList = (await vehicleRes.json()) as Record<string, unknown>[];
        const keyList = (await keysRes.json()) as SpareKey[];
        const locationList = (await locationsRes.json()) as KeyLocation[];
        const found = vehicleList.find((item) => String(item.id) === id) || null;
        setVehicle(found as Record<string, unknown> | null);
        setNarrativeForm({
          timeline: String(found?.timeline ?? ""),
          comments: String(found?.comments ?? ""),
          maintenanceRecords: String(found?.maintenanceRecords ?? ""),
          restorationHistory: String(found?.restorationHistory ?? ""),
          tuningDetails: String(found?.tuningDetails ?? ""),
        });
        setKeys(Array.isArray(keyList) ? keyList : []);
        setLocations(Array.isArray(locationList) ? locationList : []);
      } catch {
        setVehicle(null);
      }
    })();
  }, [id, router]);

  const refreshKeys = async () => {
    if (!id) return;
    const res = await fetch(`/api/spare-keys?vehicleId=${id}`);
    const list = (await res.json()) as SpareKey[];
    setKeys(Array.isArray(list) ? list : []);
  };

  const refreshLocations = async () => {
    const res = await fetch("/api/key-locations");
    const list = (await res.json()) as KeyLocation[];
    setLocations(Array.isArray(list) ? list : []);
  };

  const addKeyLocation = async () => {
    if (!locationForm.name) return;
    await fetch("/api/key-locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(locationForm),
    });
    setLocationForm({ name: "", description: "" });
    await refreshLocations();
  };

  const addKey = async () => {
    if (!id) return;
    await fetch("/api/spare-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId: id, ...form }),
    });
    setForm({ keyType: "Original Key", status: "Available", locationId: "", notes: "" });
    await refreshKeys();
  };

  const deleteKey = async (keyId: string) => {
    await fetch(`/api/spare-keys?id=${keyId}`, { method: "DELETE" });
    await refreshKeys();
  };

  const canEditVehicleNarrative = session.user?.role === "admin" || session.user?.role === "co-admin";

  const saveVehicleNarrative = async () => {
    if (!id || !canEditVehicleNarrative) return;

    setIsSavingNarrative(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...narrativeForm }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Unable to save vehicle details");
      }

      const updatedVehicle = (await response.json()) as Record<string, unknown>;
      setVehicle(updatedVehicle);
      setNarrativeForm({
        timeline: String(updatedVehicle.timeline ?? ""),
        comments: String(updatedVehicle.comments ?? ""),
        maintenanceRecords: String(updatedVehicle.maintenanceRecords ?? ""),
        restorationHistory: String(updatedVehicle.restorationHistory ?? ""),
        tuningDetails: String(updatedVehicle.tuningDetails ?? ""),
      });
      setSaveMessage("Vehicle details updated");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Unable to save vehicle details");
    } finally {
      setIsSavingNarrative(false);
    }
  };

  if (!vehicle) return <div>Loading...</div>;

  const vid = String(vehicle.id ?? "");
  const qr = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(`collector-garage://vehicle/${vid}`)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{String(vehicle.name ?? "Untitled")}</h1>
          <p className="text-sm text-slate-400">{String(vehicle.year ?? "")}</p>
        </div>
        <div className="flex items-center gap-3">
          <a href={qr} download={`qr-${vid}.png`} className="rounded-md bg-slate-800/60 px-3 py-2 text-sm text-slate-200">Download PNG</a>
          <a href={`/vehicle/${vid}`} target="_blank" rel="noreferrer" className="rounded-md bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900">Open QR page</a>
        </div>
      </div>

      <section className="rounded-2xl border border-white/6 bg-slate-900/40 p-4">
        <h2 className="text-lg font-semibold text-white">Overview</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="col-span-2">
            <h3 className="text-sm font-medium text-slate-300">Specifications</h3>
            <ul className="mt-2 text-sm text-slate-400">
              <li>Make/Model: {String(vehicle.make ?? "—")} {String(vehicle.model ?? "")}</li>
              <li>Status: {String(vehicle.status ?? "active")}</li>
              <li>VIN: {String(vehicle.vin ?? "—")}</li>
              <li>License: {String(vehicle.licensePlateNumber ?? vehicle.license_plate_number ?? "—")}</li>
              <li>Engine: {String(vehicle.engineNumber ?? vehicle.engine_number ?? "—")}</li>
              <li>Color: {String(vehicle.color ?? "—")}</li>
              <li>Mileage: {String(vehicle.mileage ?? "—")}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-300">QR Code</h3>
            <img src={qr} alt="qr" className="mt-2 h-40 w-40 rounded-md bg-white/5" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/6 bg-slate-900/40 p-4">
        <h2 className="text-lg font-semibold text-white">Spare Keys</h2>
        <p className="mt-2 text-sm text-slate-400">Manage every key linked to this vehicle. Each key can have a type, status, and a storage location.</p>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/8 bg-slate-800/40 p-4">
            <h3 className="text-sm font-semibold text-white">Add key</h3>
            <div className="mt-3 space-y-3">
              <select value={form.keyType} onChange={(e) => setForm((s) => ({ ...s, keyType: e.target.value }))} className="w-full rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
                <option>Original Key</option>
                <option>Spare Key</option>
                <option>Valet Key</option>
                <option>Smart Key</option>
              </select>
              <select value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))} className="w-full rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
                <option>Available</option>
                <option>Missing</option>
                <option>Damaged</option>
              </select>
              <select value={form.locationId} onChange={(e) => setForm((s) => ({ ...s, locationId: e.target.value }))} className="w-full rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name ?? "Location"}</option>
                ))}
              </select>
              <textarea value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} placeholder="Notes" className="w-full rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200" />
              <button onClick={addKey} className="rounded-md bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900">Add key</button>
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-slate-800/40 p-4">
            <h3 className="text-sm font-semibold text-white">Key locations</h3>
            <div className="mt-3 space-y-3">
              <input value={locationForm.name} onChange={(e) => setLocationForm((s) => ({ ...s, name: e.target.value }))} placeholder="Location name" className="w-full rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200" />
              <textarea value={locationForm.description} onChange={(e) => setLocationForm((s) => ({ ...s, description: e.target.value }))} placeholder="Description" className="w-full rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200" />
              <button onClick={addKeyLocation} className="rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-white">Create location</button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {locations.map((loc) => (
                <span key={loc.id} className="rounded-full bg-slate-700/70 px-3 py-1 text-sm text-slate-200">{loc.name}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {keys.map((key) => {
            const location = locations.find((loc) => loc.id === key.locationId);
            return (
              <div key={key.id} className="rounded-xl border border-white/8 bg-slate-800/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{key.keyType ?? "Key"}</div>
                    <div className="text-sm text-slate-400">{location?.name ?? "No location"}</div>
                  </div>
                  <div className="text-right text-sm text-slate-400">
                    <div>{key.status ?? "Available"}</div>
                    <button onClick={() => deleteKey(key.id)} className="mt-2 rounded-md bg-rose-500/20 px-2 py-1 text-sm text-rose-200">Remove</button>
                  </div>
                </div>
                {key.notes ? <div className="mt-2 text-sm text-slate-400">{key.notes}</div> : null}
              </div>
            );
          })}
          {keys.length === 0 ? <div className="rounded-xl border border-dashed border-white/8 p-4 text-sm text-slate-400">No keys recorded yet.</div> : null}
        </div>
      </section>

      <section className="rounded-2xl border border-white/6 bg-slate-900/40 p-4">
        <h2 className="text-lg font-semibold text-white">History Timeline</h2>
        <p className="mt-2 text-sm text-slate-400">Add and view events (purchase, maintenance, restoration, movements, modifications).</p>
        {canEditVehicleNarrative ? (
          <div className="mt-4 space-y-3">
            <textarea
              value={narrativeForm.timeline}
              onChange={(event) => setNarrativeForm((current) => ({ ...current, timeline: event.target.value }))}
              placeholder="Add purchase milestones, movements, and modifications"
              className="min-h-32 w-full rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200"
            />
            <button onClick={saveVehicleNarrative} disabled={isSavingNarrative} className="rounded-md bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60">
              {isSavingNarrative ? "Saving..." : "Save timeline"}
            </button>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-white/8 bg-slate-800/40 p-4 text-sm text-slate-300 whitespace-pre-wrap">
            {String(vehicle.timeline ?? "No history recorded yet.")}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/6 bg-slate-900/40 p-4">
          <h3 className="text-sm font-medium text-slate-300">Comments</h3>
          {canEditVehicleNarrative ? (
            <textarea
              value={narrativeForm.comments}
              onChange={(event) => setNarrativeForm((current) => ({ ...current, comments: event.target.value }))}
              placeholder="Add comments from users"
              className="mt-3 min-h-32 w-full rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200"
            />
          ) : (
            <p className="mt-2 text-sm text-slate-400 whitespace-pre-wrap">{String(vehicle.comments ?? "No comments recorded.")}</p>
          )}
        </div>
        <div className="rounded-2xl border border-white/6 bg-slate-900/40 p-4">
          <h3 className="text-sm font-medium text-slate-300">Maintenance</h3>
          {canEditVehicleNarrative ? (
            <textarea
              value={narrativeForm.maintenanceRecords}
              onChange={(event) => setNarrativeForm((current) => ({ ...current, maintenanceRecords: event.target.value }))}
              placeholder="Add past and upcoming services"
              className="mt-3 min-h-32 w-full rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200"
            />
          ) : (
            <p className="mt-2 text-sm text-slate-400 whitespace-pre-wrap">{String(vehicle.maintenanceRecords ?? "No maintenance records recorded.")}</p>
          )}
        </div>
        <div className="rounded-2xl border border-white/6 bg-slate-900/40 p-4">
          <h3 className="text-sm font-medium text-slate-300">Restoration & Tuning</h3>
          {canEditVehicleNarrative ? (
            <textarea
              value={narrativeForm.restorationHistory}
              onChange={(event) => setNarrativeForm((current) => ({ ...current, restorationHistory: event.target.value }))}
              placeholder="Add restoration projects"
              className="mt-3 min-h-24 w-full rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200"
            />
          ) : (
            <p className="mt-2 text-sm text-slate-400 whitespace-pre-wrap">{String(vehicle.restorationHistory ?? "No restoration projects recorded.")}</p>
          )}
          {canEditVehicleNarrative ? (
            <textarea
              value={narrativeForm.tuningDetails}
              onChange={(event) => setNarrativeForm((current) => ({ ...current, tuningDetails: event.target.value }))}
              placeholder="Add tuning records"
              className="mt-3 min-h-24 w-full rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-200"
            />
          ) : (
            <p className="mt-2 text-sm text-slate-400 whitespace-pre-wrap">{String(vehicle.tuningDetails ?? "No tuning records recorded.")}</p>
          )}
        </div>
      </section>

      {canEditVehicleNarrative ? (
        <div className="flex items-center gap-3">
          <button onClick={saveVehicleNarrative} disabled={isSavingNarrative} className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60">
            {isSavingNarrative ? "Saving all sections..." : "Save comments, maintenance, and restoration"}
          </button>
          {saveMessage ? <p className="text-sm text-slate-400">{saveMessage}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
