import { describe, expect, it } from "vitest";
import { createVehicleType, getAdminSettings } from "./admin-store";

describe("admin settings store", () => {
  it("creates a custom vehicle type and persists it", async () => {
    const initial = await getAdminSettings();
    const created = await createVehicleType({ name: "Grand Tourer", description: "Premium touring coupe" });

    expect(created.name).toBe("Grand Tourer");
    const updated = await getAdminSettings();
    expect(updated.vehicleTypes.some((item) => item.id === created.id)).toBe(true);
    expect(updated.vehicleTypes.length).toBe(initial.vehicleTypes.length + 1);
  });
});
