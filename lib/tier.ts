import { prisma } from "@/lib/prisma";
import { Prisma, WriterTier } from "@prisma/client";

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

export async function addTierScore(userId: string, points: number, tx: Prisma.TransactionClient | typeof prisma = prisma) {
  if (!Number.isInteger(points) || points === 0) throw new Error("Tier points must be a non-zero integer.");

  const user = await tx.user.update({
    where: { id: userId },
    data: { tierScore: { increment: points } },
    select: { tier: true, tierScore: true },
  });
  const calculatedTier = calculateTier(Math.max(0, user.tierScore));
  if (user.tier !== "FEATURED" && tierRank[calculatedTier] > tierRank[user.tier]) {
    await tx.user.update({ where: { id: userId }, data: { tier: calculatedTier } });
  }
  return { ...user, calculatedTier };
}

export async function awardTierEvent(userId: string, eventKey: string, kind: string, points: number) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.tierEvent.findUnique({ where: { eventKey } });
    if (existing) return { awarded: false, event: existing };
    const event = await tx.tierEvent.create({ data: { userId, eventKey, kind, points } });
    await addTierScore(userId, points, tx);
    return { awarded: true, event };
  });
}

export async function removeTierEvent(eventKey: string) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.tierEvent.findUnique({ where: { eventKey } });
    if (!event || !event.active) return { removed: false };
    await tx.tierEvent.update({ where: { id: event.id }, data: { active: false } });
    await addTierScore(event.userId, -event.points, tx);
    return { removed: true };
  });
}

export async function recordStoryView(authorId: string, workId: string, sessionId: string, date: string) {
  return prisma.$transaction(async (tx) => {
    const eventKey = `VIEW:${authorId}:${workId}:${date}:${sessionId}`;
    const existing = await tx.tierEvent.findUnique({ where: { eventKey } });
    if (existing) return { recorded: false };
    const dailyViews = await tx.tierEvent.count({
      where: { userId: authorId, kind: "VIEW", active: true, eventKey: { startsWith: `VIEW:${authorId}:${workId}:${date}:` } },
    });
    if (dailyViews >= 50) return { recorded: false, capped: true };
    await tx.tierEvent.create({ data: { userId: authorId, eventKey, kind: "VIEW", points: 1 } });
    await tx.user.update({ where: { id: authorId }, data: { tierScore: { increment: 1 }, readsCount: { increment: 1 } } });
    const user = await tx.user.findUniqueOrThrow({ where: { id: authorId }, select: { tier: true, tierScore: true } });
    const calculatedTier = calculateTier(Math.max(0, user.tierScore));
    if (user.tier !== "FEATURED" && tierRank[calculatedTier] > tierRank[user.tier]) {
      await tx.user.update({ where: { id: authorId }, data: { tier: calculatedTier } });
    }
    return { recorded: true };
  });
}
