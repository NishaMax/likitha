import type { WriterTier } from "@prisma/client";

const labels: Record<WriterTier, string> = {
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  DIAMOND: "Diamond",
  FEATURED: "Featured",
};

export default function TierBadge({ tier }: { tier: WriterTier }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#c8a96e]/35 bg-[#c8a96e]/[.08] px-3 py-1 text-xs font-semibold text-[#c8a96e]">
      {labels[tier]} writer
    </span>
  );
}
