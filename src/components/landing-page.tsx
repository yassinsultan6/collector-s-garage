"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CarFront } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { splitPhotoUrls } from "@/lib/vehicle-photo-utils";

interface PublicVehicle {
  id: string;
  name?: string;
  make?: string;
  model?: string;
  type?: string;
  customType?: string;
  photos?: string;
  year?: string;
  status?: string;
  color?: string;
  mileage?: string;
}

export function LandingPage() {
  const [vehicles, setVehicles] = useState<PublicVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadVehicles = async () => {
      try {
        const response = await fetch("/api/vehicles", { credentials: "include" });
        if (!response.ok) throw new Error("Unable to load featured vehicles");
        const nextVehicles = (await response.json()) as PublicVehicle[];
        if (active) setVehicles(Array.isArray(nextVehicles) ? nextVehicles : []);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load featured vehicles");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadVehicles();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <img src="/home-main.jpg" alt="Main collection" className="h-[260px] w-full object-cover sm:h-[360px] lg:h-[480px]" />
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)] backdrop-blur">

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Loading featured vehicles…</div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
        ) : null}

        {!loading && !error && vehicles.length === 0 ? (
          <EmptyState title="No public vehicles yet" description="Nothing has been shared publicly yet." />
        ) : null}

        {!loading && !error && vehicles.length > 0 ? (
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <Link key={vehicle.id} href={`/vehicle/${vehicle.id}`} className="block rounded-[1.5rem] border border-slate-200 bg-white p-4 transition hover:border-amber-300 hover:shadow-md">
                <div className="grid gap-4 md:grid-cols-[280px_1fr] md:items-center">
                  <div className="overflow-hidden rounded-[1.25rem] bg-slate-100">
                    {splitPhotoUrls(vehicle.photos)[0] ? (
                      <img src={splitPhotoUrls(vehicle.photos)[0]} alt={vehicle.name || "Vehicle photo"} className="h-56 w-full object-cover" />
                    ) : (
                      <div className="flex h-56 items-center justify-center text-amber-700">
                        <CarFront className="h-10 w-10" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-900">{vehicle.name || "Untitled vehicle"}</h2>
                      <p className="mt-1 text-sm text-slate-500">{[vehicle.make, vehicle.model].filter(Boolean).join(" ") || vehicle.customType || vehicle.type || "Public profile"}</p>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                      <div><span className="font-medium text-slate-900">Category:</span> {vehicle.customType || vehicle.type || "—"}</div>
                      <div><span className="font-medium text-slate-900">Year:</span> {vehicle.year || "—"}</div>
                      <div><span className="font-medium text-slate-900">Status:</span> {vehicle.status || "—"}</div>
                      <div><span className="font-medium text-slate-900">Color:</span> {vehicle.color || "—"}</div>
                      <div><span className="font-medium text-slate-900">Mileage:</span> {vehicle.mileage || "—"}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
