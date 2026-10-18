import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toContain("a");
    expect(cn("b")).toContain("b");
  });

  it("handles conditional classes", () => {
    const hidden = false;
    expect(cn("base", hidden && "hidden", "visible")).toBe("base visible");
  });
});
