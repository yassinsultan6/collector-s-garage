"use client";

import React from "react";
import { motion } from "framer-motion";
import { Car, MapPin, Hash } from "lucide-react";
import { splitPhotoUrls } from "@/lib/vehicle-photo-utils";

type Vehicle = {
  id: string;
  name?: string;
  type?: string;
  customType?: string;
  photos?: string;
  year?: string | number;
  status?: string;
};

export default function VehicleCard({ vehicle, onClick }: { vehicle: Vehicle; onClick?: () => void }) {
  const title = vehicle.name?.trim() || "Untitled vehicle";
  const subtitle = [vehicle.customType ?? vehicle.type, vehicle.year ? String(vehicle.year) : undefined].filter(Boolean).join(" • ");
  const primaryPhoto = splitPhotoUrls(vehicle.photos)[0];

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      className="group relative rounded-2xl border border-white/8 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-4 shadow-lg"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="h-16 w-28 overflow-hidden rounded-lg bg-slate-700/30 flex items-center justify-center text-slate-300">
          {primaryPhoto ? (
            <img src={primaryPhoto} alt={title} className="h-full w-full object-cover" />
          ) : (
            <Car className="h-8 w-8" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{title || "Untitled"}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400" />
          </div>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          <div className="mt-3 flex items-center gap-3 text-sm text-slate-400">
            <div className="inline-flex items-center gap-1">
              <Hash className="h-4 w-4" />
              <span>{vehicle.status ?? "Public profile"}</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Collection listing</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
