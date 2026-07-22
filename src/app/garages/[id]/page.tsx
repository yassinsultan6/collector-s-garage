"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { GarageSpot } from "../../../lib/garage-store";
import type { Vehicle } from "../../../lib/vehicle-store";
import type { Garage } from "../../../lib/garage-store";

export default function GarageDetailsPage() {
  const params = useParams() as Record<string, string | undefined>;
  const id = params.id;
  const [garage, setGarage] = useState<Garage | null>(null);
  const [spots, setSpots] = useState<GarageSpot[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [creatingSpot, setCreatingSpot] = useState(false);
  const [newSpotNumber, setNewSpotNumber] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [gR, sR, vR] = await Promise.all([fetch(`/api/garages/${id}`), fetch(`/api/garage-spots`), fetch(`/api/vehicles`)]);
        const g = await gR.json();
        const s = await sR.json();
        const v = await vR.json();
        setGarage(g || null);
        setSpots(
          Array.isArray(s) ? (s.filter((x: unknown) => (x as GarageSpot).garageId === id) as GarageSpot[]) : []
        );
        setVehicles(Array.isArray(v) ? (v as Vehicle[]) : []);
      } catch {
        setGarage(null);
      }
    })();
  }, [id]);

  const createSpot = async () => {
    if (!id || !newSpotNumber) return;
    setCreatingSpot(true);
    try {
      const res = await fetch(`/api/garage-spots`, { method: "POST", body: JSON.stringify({ garageId: id, spotNumber: newSpotNumber }) });
      if (res.ok) {
        const obj = await res.json();
        setSpots((s) => [...s, obj]);
        setNewSpotNumber("");
      }
    } finally {
      setCreatingSpot(false);
    }
  };

  const assign = async (spotId: string, vehicleId?: string | null) => {
    try {
      const res = await fetch(`/api/garage-spots/assign`, { method: "POST", body: JSON.stringify({ spotId, vehicleId }) });
      if (res.ok) {
        const updated = await res.json();
        setSpots((s) => s.map((sp) => (sp.id === updated.id ? updated : sp)));
        // refresh vehicles list
        const vR = await fetch(`/api/vehicles`);
        const v = await vR.json();
        setVehicles(Array.isArray(v) ? v : []);
      }
    } catch {}
  };

  if (!garage) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{garage.name}</h1>
          <p className="text-sm text-slate-400">{garage.address}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-white/6 bg-slate-900/40 p-4">
        <h2 className="text-lg font-semibold text-white">Layout</h2>
        <p className="mt-2 text-sm text-slate-400">Visual layout of spots and assignments.</p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spots.map((s) => (
            <div key={s.id} className="rounded-lg border border-white/8 p-4 bg-slate-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{s.spotNumber}</h3>
                  <p className="text-sm text-slate-400">{s.description}</p>
                </div>
                <div className="text-sm text-slate-300">
                  {s.vehicleId ? (
                    <div>
                      <div className="font-medium text-white">Assigned</div>
                      <button onClick={() => assign(s.id, null)} className="mt-2 rounded-md bg-rose-500/20 px-2 py-1 text-sm">Unassign</button>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-white">Empty</div>
                      <select onChange={(e) => assign(s.id, e.target.value)} className="mt-2 rounded-md bg-slate-900/60 px-2 py-1 text-sm text-slate-200">
                        <option value="">Assign vehicle</option>
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>{v.name ?? `${v.type ?? ""}`}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <input placeholder="Spot number" value={newSpotNumber} onChange={(e) => setNewSpotNumber(e.target.value)} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
          <button onClick={createSpot} disabled={creatingSpot} className="rounded-md bg-amber-400 px-3 py-2 text-sm text-slate-900">Create Spot</button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white">Example layout</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {spots.map((s) => (
            <div key={s.id} className="rounded-md bg-slate-800/40 p-3">
              <div className="font-medium text-white">{s.spotNumber}</div>
              <div className="text-sm text-slate-400">{s.vehicleId ? `Vehicle ${s.vehicleId}` : "Empty"}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
