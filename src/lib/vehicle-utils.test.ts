import { describe, expect, it } from "vitest";
import { buildVehicleSubtitle, getVehicleTypeLabel } from "./vehicle-utils";

describe("vehicle utilities", () => {
  it("builds a concise subtitle from optional fields", () => {
    const subtitle = buildVehicleSubtitle({
      name: "Tempest",
      type: "Hypercar",
      location: "Dubai",
      year: "2024",
    });

    expect(subtitle).toContain("Dubai");
    expect(subtitle).toContain("2024");
  });

  it("prefers a custom vehicle type when provided", () => {
    expect(getVehicleTypeLabel("Custom", "Grand Tourer")).toBe("Grand Tourer");
    expect(getVehicleTypeLabel("Hypercar", "")).toBe("Hypercar");
  });
});
