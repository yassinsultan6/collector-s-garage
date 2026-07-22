"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { splitPhotoUrls } from "@/lib/vehicle-photo-utils";

export default function VehiclePublicPage() {
  const params = useParams() as Record<string, string | undefined>;
  const id = params.id;
  const [vehicle, setVehicle] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch("/api/vehicles");
        const list = (await res.json()) as Record<string, unknown>[];
        const found = list.find((item) => String(item.id) === id) || null;
        setVehicle(found as Record<string, unknown> | null);
      } catch {
        setVehicle(null);
      }
    })();
  }, [id]);

  if (!vehicle) return <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc_0%,_#fff7ed_100%)] p-6 text-slate-700">Loading vehicle profile…</div>;

  const photoUrls = splitPhotoUrls(String(vehicle.photos ?? ""));
  const history = String(vehicle.timeline ?? vehicle.restorationHistory ?? "").trim();

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc_0%,_#fff7ed_100%)] text-slate-800">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-amber-600">Yehia Rashdan</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">{String(vehicle.name ?? "Untitled vehicle")}</h1>
              <p className="mt-3 text-slate-600">Simple public access to the selected vehicle profile.</p>
              <div className="mt-6 space-y-2 text-sm text-slate-700">
                <div>Manufacture date: {String(vehicle.year ?? "—")}</div>
                <div>Category: {String(vehicle.customType ?? vehicle.type ?? "—")}</div>
                <div>Status: {String(vehicle.status ?? "Public profile")}</div>
              </div>
              {history ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">History</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{history}</p>
                </div>
              ) : null}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              {photoUrls.length > 0 ? (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-2xl bg-white">
                    <img src={photoUrls[0]} alt={String(vehicle.name ?? "Vehicle photo")} className="h-72 w-full object-cover" />
                  </div>
                  {photoUrls.length > 1 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {photoUrls.slice(1).map((photoUrl, index) => (
                        <div key={`${photoUrl}-${index}`} className="overflow-hidden rounded-xl bg-white">
                          <img src={photoUrl} alt={`${String(vehicle.name ?? "Vehicle photo")} ${index + 2}`} className="h-24 w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">
                  No public vehicle photos available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
