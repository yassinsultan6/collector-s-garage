import { describe, expect, it } from "vitest";
import { fromVehicleRecord, toVehicleRecord } from "./supabase-persistence";

describe("supabase persistence helpers", () => {
  it("maps vehicle fields between app and Supabase shape", () => {
    const appPayload = {
      id: "veh-1",
      name: "R-8 Vision",
      type: "Hypercar",
      customType: "Prototype",
      isPublic: true,
      year: "2024",
      location: "Dubai",
      garage: "Vault",
    };

    const supabasePayload = toVehicleRecord(appPayload);
    expect(supabasePayload.custom_type).toBe("Prototype");
    expect(supabasePayload.garage).toBe("Vault");
    expect(supabasePayload.is_public).toBe(true);

    const restored = fromVehicleRecord(supabasePayload as any);
    expect(restored.customType).toBe("Prototype");
    expect(restored.name).toBe("R-8 Vision");
    expect(restored.isPublic).toBe(true);
  });
});
