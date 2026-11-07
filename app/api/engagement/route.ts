import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { awardTierEvent, removeTierEvent } from "@/lib/tier";

const schema = z.object({
  action: z.enum(["like", "save"]),
  workId: z.string().trim().min(1).max(120),
});

async function currentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() }, select: { id: true } });
}

export async function GET(request: Request) {
  const user = await currentUser();
  const workId = new URL(request.url).searchParams.get("workId");
  if (!workId) return NextResponse.json({ error: "Work ID is required." }, { status: 400 });
  const [likes, saves] = await Promise.all([
    prisma.workLike.count({ where: { workId } }),
    user ? prisma.savedWork.findUnique({ where: { userId_workId: { userId: user.id, workId } } }) : null,
  ]);
  const liked = user ? Boolean(await prisma.workLike.findUnique({ where: { userId_workId: { userId: user.id, workId } } })) : false;
  return NextResponse.json({ likes, liked, saved: Boolean(saves) });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in to like or save works." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid engagement request." }, { status: 400 });
  const { action, workId } = parsed.data;
  if (action === "like") {
    const existing = await prisma.workLike.findUnique({ where: { userId_workId: { userId: user.id, workId } } });
    const work = await prisma.work.findUnique({ where: { id: workId }, select: { authorId: true } });
    if (existing) {
      await prisma.$transaction(async (tx) => {
        await tx.workLike.delete({ where: { id: existing.id } });
        if (work && work.authorId !== user.id) {
          await tx.user.update({ where: { id: work.authorId }, data: { likesReceived: { decrement: 1 } } });
        }
      });
      if (work && work.authorId !== user.id) await removeTierEvent(`LIKE:${user.id}:${workId}`);
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.workLike.create({ data: { userId: user.id, workId } });
        if (work && work.authorId !== user.id) {
          await tx.user.update({ where: { id: work.authorId }, data: { likesReceived: { increment: 1 } } });
        }
      });
      if (work && work.authorId !== user.id) await awardTierEvent(work.authorId, `LIKE:${user.id}:${workId}`, "LIKE", 5);
    }
  } else {
    const existing = await prisma.savedWork.findUnique({ where: { userId_workId: { userId: user.id, workId } } });
    if (existing) await prisma.savedWork.delete({ where: { id: existing.id } });
    else await prisma.savedWork.create({ data: { userId: user.id, workId } });
  }
  return GET(new Request(new URL(`/api/engagement?workId=${encodeURIComponent(workId)}`, request.url)));
}
