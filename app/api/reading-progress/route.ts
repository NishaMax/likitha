import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const progressSchema = z.object({
  workId: z.string().trim().min(1).max(120),
  workType: z.enum(["STORY", "POETRY", "SONG"]),
  chapterNumber: z.number().int().min(1).optional(),
  totalChapters: z.number().int().min(1).optional(),
  completed: z.boolean().optional(),
});

async function getUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true },
  });
}

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

  const workId = new URL(request.url).searchParams.get("workId");
  const progress = await prisma.readingProgress.findMany({
    where: { userId: user.id, ...(workId ? { workId } : {}) },
    orderBy: { lastReadAt: "desc" },
  });

  return NextResponse.json({ progress });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in to track your reading." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid progress request." }, { status: 400 });
  }

  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reading progress." }, { status: 400 });
  }

  const data = parsed.data;
  const existing = await prisma.readingProgress.findUnique({
    where: { userId_workId: { userId: user.id, workId: data.workId } },
  });
  const chaptersRead = Math.max(existing?.chaptersRead ?? 0, data.chapterNumber ?? 0);
  const completed = existing?.completed || data.completed === true || (
    data.workType === "STORY" &&
    data.totalChapters !== undefined &&
    chaptersRead >= data.totalChapters
  );

  const progress = await prisma.readingProgress.upsert({
    where: { userId_workId: { userId: user.id, workId: data.workId } },
    create: {
      userId: user.id,
      workId: data.workId,
      workType: data.workType,
      chaptersRead,
      totalChapters: data.totalChapters,
      lastChapter: data.chapterNumber,
      completed,
    },
    update: {
      workType: data.workType,
      chaptersRead,
      totalChapters: data.totalChapters ?? existing?.totalChapters,
      lastChapter: data.chapterNumber ?? existing?.lastChapter,
      completed,
    },
  });

  return NextResponse.json({ progress });
}
