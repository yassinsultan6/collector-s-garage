"use client";

import React, { useEffect, useState } from "react";
import VehicleList from "../../components/vehicles/VehicleList";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SessionState = {
  authenticated: boolean;
  user: { role: "viewer" | "co-admin" | "admin"; canAccessAdmin: boolean } | null;
};

export default function VehiclesPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const response = await fetch("/api/auth/session", { credentials: "include" });
      if (!response.ok) { router.replace("/login"); return; }
      const next = (await response.json()) as SessionState;
      const isAdmin = next.authenticated && (next.user?.role === "admin" || next.user?.role === "co-admin");
      if (!isAdmin) { router.replace("/login"); return; }
      setSession(next);
    };

    void loadSession();
  }, [router]);

  if (!session) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Vehicles</h1>
        <Link href="/vehicles/new" className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900">Add Vehicle</Link>
      </div>
      <VehicleList />
    </div>
  );
}
