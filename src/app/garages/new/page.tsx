"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewGaragePage() {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/garages", { method: "POST", body: JSON.stringify(form) });
      if (res.ok) {
        const obj = await res.json();
        router.push(`/garages/${obj.id}`);
        return;
      }
      setSaving(false);
      alert("Failed to save");
    } catch {
      setSaving(false);
      alert("Failed to save");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Add Garage</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input name="name" placeholder="Name" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input name="address" placeholder="Address" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input name="capacity" placeholder="Capacity" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <input name="image" placeholder="Image URL" onChange={handle} className="rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
        <textarea name="description" placeholder="Description" onChange={handle} className="col-span-1 rounded-md bg-slate-900/50 px-3 py-2 text-sm text-slate-200 sm:col-span-2" />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900">{saving ? "Saving..." : "Save"}</button>
      </div>
    </div>
  );
}
