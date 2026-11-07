import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PublicationStatus } from "@prisma/client";
import { awardTierEvent } from "@/lib/tier";
import { createNotification } from "@/lib/notifications";

const reviewSchema = z.object({
  entityType: z.enum(["work", "chapter"]),
  entityId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  note: z.string().trim().max(1000).optional(),
});

async function getAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true, role: true },
  });
  return user?.role === "ADMIN" ? user : null;
}

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  const [works, chapters] = await Promise.all([
    prisma.work.findMany({
      where: { status: "PENDING" },
      orderBy: { submittedAt: "asc" },
      select: {
        id: true, type: true, title: true, description: true, genre: true, content: true, submittedAt: true,
        author: { select: { displayName: true, email: true } },
      },
    }),
    prisma.chapter.findMany({
      where: { status: "PENDING" },
      orderBy: { submittedAt: "asc" },
      select: {
        id: true, chapterNo: true, title: true, content: true, submittedAt: true,
        work: { select: { id: true, title: true, author: { select: { displayName: true, email: true } } } },
      },
    }),
  ]);

  return NextResponse.json({ works, chapters });
}

export async function PATCH(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid review request." }, { status: 400 });
  }
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid review action." }, { status: 400 });

  const status: PublicationStatus = parsed.data.action === "approve" ? "APPROVED" : "REJECTED";
  const reviewData = { status, reviewNote: parsed.data.note || null, reviewedAt: new Date(), ...(status === "APPROVED" ? { publishedAt: new Date() } : {}) };

  if (parsed.data.entityType === "work") {
    const work = await prisma.work.findFirst({ where: { id: parsed.data.entityId, status: "PENDING" }, select: { authorId: true, type: true } });
    const result = work ? await prisma.work.updateMany({
      where: { id: parsed.data.entityId, status: "PENDING" },
      data: reviewData,
    }) : { count: 0 };
    if (result.count === 0) return NextResponse.json({ error: "Pending work not found." }, { status: 404 });
    if (work) await createNotification(work.authorId, "REVIEW", `Your work was ${status === "APPROVED" ? "approved" : "rejected"}.`, "/dashboard/works");
  } else {
    const chapter = await prisma.chapter.findFirst({
      where: { id: parsed.data.entityId, status: "PENDING" },
      select: { id: true, work: { select: { authorId: true } } },
    });
    const result = chapter ? await prisma.chapter.updateMany({
      where: { id: parsed.data.entityId, status: "PENDING" },
      data: reviewData,
    }) : { count: 0 };
    if (result.count === 0) return NextResponse.json({ error: "Pending chapter not found." }, { status: 404 });
    if (status === "APPROVED" && chapter) await awardTierEvent(chapter.work.authorId, `CHAPTER_APPROVED:${chapter.id}`, "CHAPTER_APPROVED", 2);
    if (chapter) await createNotification(chapter.work.authorId, "REVIEW", `Your chapter was ${status === "APPROVED" ? "approved" : "rejected"}.`, "/dashboard/works");
  }

  return NextResponse.json({ ok: true });
}
