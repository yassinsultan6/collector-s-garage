"use client";

import React from "react";

import { Funnel } from "lucide-react";

type Vehicle = { type?: string | null; customType?: string | null; year?: string | number | null; status?: string | null };

export default function VehicleFilters({
  vehicles,
  onChange,
}: {
  vehicles: Vehicle[];
  onChange: (filters: Record<string, unknown>) => void;
}) {
  const types = Array.from(new Set(vehicles.map((v) => v.type).filter((x): x is string => Boolean(x))));
  const years = Array.from(new Set(vehicles.map((v) => v.year).filter((x): x is string | number => x !== null && x !== undefined))).sort((a, b) => Number(b) - Number(a));

  const handle = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    onChange({ [name]: type === "checkbox" ? checked : value });
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center gap-2 rounded-md bg-slate-800/50 p-2">
        <Funnel />
        <label className="text-sm text-slate-300">Filters</label>
      </div>

      <select name="type" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200">
        <option value="">All categories</option>
        {types.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select name="year" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200">
        <option value="">Any year</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <select name="status" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200">
        <option value="">Any status</option>
        <option value="active">Active</option>
        <option value="stored">Stored</option>
        <option value="selling">Selling</option>
      </select>

    </div>
  );
}
