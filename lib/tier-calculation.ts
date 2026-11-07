import type { WriterTier } from "@prisma/client";

const tierRank: Record<WriterTier, number> = {
  BRONZE: 0,
  SILVER: 1,
  GOLD: 2,
  DIAMOND: 3,
  FEATURED: 4,
};

export function calculateTier(score: number): Exclude<WriterTier, "FEATURED"> {
  if (score >= 2000) return "DIAMOND";
  if (score >= 500) return "GOLD";
  if (score >= 100) return "SILVER";
  return "BRONZE";
}

export function canUpgradeTier(current: WriterTier, score: number) {
  return current !== "FEATURED" && tierRank[calculateTier(Math.max(0, score))] > tierRank[current];
}
