import { describe, expect, it } from "vitest";
import { calculateTier, canUpgradeTier } from "../lib/tier-calculation";

describe("calculateTier", () => {
  it.each([
    [-1, "BRONZE"],
    [0, "BRONZE"],
    [99, "BRONZE"],
    [100, "SILVER"],
    [499, "SILVER"],
    [500, "GOLD"],
    [1999, "GOLD"],
    [2000, "DIAMOND"],
  ])("maps score %i to %s", (score, tier) => {
    expect(calculateTier(score)).toBe(tier);
  });
});

describe("canUpgradeTier", () => {
  it("protects Featured from automatic replacement", () => {
    expect(canUpgradeTier("FEATURED", 9999)).toBe(false);
  });

  it("only upgrades when the calculated tier is higher", () => {
    expect(canUpgradeTier("BRONZE", 100)).toBe(true);
    expect(canUpgradeTier("GOLD", 100)).toBe(false);
  });
});
