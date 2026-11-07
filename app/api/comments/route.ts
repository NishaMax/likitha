import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { awardTierEvent } from "@/lib/tier";
import { createNotification } from "@/lib/notifications";
import { works } from "@/lib/stories";

const schema = z.object({ workId: z.string().trim().min(1).max(120), content: z.string().trim().min(2).max(1000) });

export async function GET(request: Request) {
  const workId = new URL(request.url).searchParams.get("workId");
  if (!workId) return NextResponse.json({ error: "Work ID is required." }, { status: 400 });
  const comments = await prisma.comment.findMany({
    where: { workId, isHidden: false },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, content: true, createdAt: true, user: { select: { displayName: true, avatarUrl: true } } },
  });
  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Comment must be 2–1000 characters." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() }, select: { id: true, isBanned: true } });
  if (!user || user.isBanned) return NextResponse.json({ error: "You cannot comment right now." }, { status: 403 });
  const work = await prisma.work.findFirst({ where: { id: parsed.data.workId, status: "APPROVED" }, select: { authorId: true, type: true } });
  const isSampleWork = works.some((item) => item.id === parsed.data.workId);
  if (!work && !isSampleWork) return NextResponse.json({ error: "Published work not found." }, { status: 404 });
  const comment = await prisma.comment.create({ data: { userId: user.id, workId: parsed.data.workId, content: parsed.data.content }, select: { id: true } });
  if (work && work.authorId !== user.id) {
    await awardTierEvent(work.authorId, `COMMENT:${user.id}:${parsed.data.workId}`, "COMMENT", 3);
    await createNotification(work.authorId, "COMMENT", "Someone commented on your work.", work.type === "STORY" ? `/story/${parsed.data.workId}` : `/work/${parsed.data.workId}`);
  }
  return NextResponse.json({ comment }, { status: 201 });
}
