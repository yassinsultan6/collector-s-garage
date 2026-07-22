"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { Garage } from "../../lib/garage-store";

export default function GaragesPage() {
  const [garages, setGarages] = useState<Garage[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/garages");
        const data = await r.json();
        setGarages(Array.isArray(data) ? data : []);
      } catch {
        setGarages([]);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Garages</h1>
        <Link href="/garages/new" className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900">Add Garage</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {garages.map((g) => (
          <div key={g.id} className="rounded-2xl border border-white/8 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{g.name ?? "Untitled"}</h3>
                <p className="text-sm text-slate-400">{g.address}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Link href={`/garages/${g.id}`} className="rounded-md bg-slate-800/60 px-3 py-2 text-sm text-slate-200">Open</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
