import { describe, expect, it } from "vitest";
import { buildVehiclePhotoStorageTarget } from "./vehicle-photo-storage";

describe("buildVehiclePhotoStorageTarget", () => {
  it("creates a safe local file path and public URL for uploaded photos", () => {
    const result = buildVehiclePhotoStorageTarget("My Car 01.png");

    expect(result.publicUrl).toContain("/uploads/vehicle-photos/");
    expect(result.publicUrl).toMatch(/\.png$/);
    expect(result.filePath.replace(/\\/g, "/")).toContain("public/uploads/vehicle-photos");
  });
});
