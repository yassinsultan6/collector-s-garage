"use client";

import React, { useEffect, useMemo, useState } from "react";
import VehicleCard from "./VehicleCard";
import VehicleFilters from "./VehicleFilters";
import { motion, AnimatePresence } from "framer-motion";

type Vehicle = {
  id: string;
  name?: string;
  type?: string;
  customType?: string;
  year?: string | number;
  status?: string;
};

export default function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/vehicles");
        const data = (await r.json()) as Vehicle[];
        setVehicles(Array.isArray(data) ? data : []);
      } catch {
        setVehicles([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (query) {
        const q = query.toLowerCase();
        if (!`${v.name ?? ""} ${v.type ?? ""} ${v.customType ?? ""}`.toLowerCase().includes(q)) return false;
      }
      if (filters.type && v.type !== filters.type) return false;
      if (filters.year && String(v.year) !== String(filters.year)) return false;
      if (filters.status && v.status !== filters.status) return false;
      return true;
    });
  }, [vehicles, query, filters]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            placeholder="Search vehicles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
          />
          <VehicleFilters vehicles={vehicles} onChange={(f) => setFilters((s) => ({ ...s, ...f }))} />
        </div>
      </div>

      <AnimatePresence>
        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <motion.div key={v.id} layout>
              <VehicleCard vehicle={v} onClick={() => window.location.assign(`/vehicles/${v.id}`)} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
