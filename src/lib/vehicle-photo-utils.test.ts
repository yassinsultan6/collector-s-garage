import { describe, expect, it } from "vitest";
import { mergePhotoUrls, splitPhotoUrls } from "./vehicle-photo-utils";

describe("mergePhotoUrls", () => {
  it("appends new photo URLs without duplicating existing entries", () => {
    expect(mergePhotoUrls("https://img.example/one\n", ["https://img.example/one", "https://img.example/two"])).toBe("https://img.example/one\nhttps://img.example/two");
  });

  it("returns a single URL when the input is empty", () => {
    expect(mergePhotoUrls("", ["https://img.example/solo"])).toBe("https://img.example/solo");
  });

  it("splits multiple stored photo URLs into a clean list", () => {
    expect(splitPhotoUrls("https://img.example/one\n\nhttps://img.example/two\r\n")).toEqual([
      "https://img.example/one",
      "https://img.example/two",
    ]);
  });
});
