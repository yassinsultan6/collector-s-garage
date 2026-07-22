export interface VehicleSummary {
  name?: string;
  type?: string;
  customType?: string;
  location?: string;
  year?: string;
}

export function getVehicleTypeLabel(type = "", customType = "") {
  return customType || type || "Custom profile";
}

export function buildVehicleSubtitle(vehicle: VehicleSummary) {
  const details = [
    vehicle.location,
    vehicle.year,
    getVehicleTypeLabel(vehicle.type, vehicle.customType),
  ].filter(Boolean);

  return details.length > 0 ? details.join(" • ") : "Draft profile ready for completion";
}

export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join("") || "CG";
}

export function getVehicleTypeOptions() {
  return [
    "Classic car",
    "Exotic car",
    "Supercar",
    "Hypercar",
    "4x4 vehicle",
    "Luxury car",
    "Modified / tuned car",
  ];
}
