import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isArtworkTemplate } from "@/lib/artwork";

const chapterSchema = z.object({
  title: z.string().trim().min(2).max(120),
  content: z.string().trim().min(20).max(100_000),
  imageUrl: z.string().regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/).max(1_400_000).nullable().optional(),
  imageColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  imageTemplate: z.string().refine(isArtworkTemplate).optional(),
  submit: z.boolean().optional(),
});

type RouteProps = { params: Promise<{ id: string; chapterId: string }> };

async function getAuthenticatedWriter() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true, role: true },
  });
  return user?.role === "WRITER" ? user : null;
}

export async function GET(request: Request, { params }: RouteProps) {
  const writer = await getAuthenticatedWriter();
  if (!writer) return NextResponse.json({ error: "Writer access is required." }, { status: 403 });
  const { id, chapterId } = await params;

  const chapter = await prisma.chapter.findFirst({
    where: {
      id: chapterId,
      workId: id,
      work: { authorId: writer.id },
    },
    include: {
      work: { select: { id: true, title: true } },
    },
  });

  if (!chapter) return NextResponse.json({ error: "Chapter not found." }, { status: 404 });
  return NextResponse.json({ chapter });
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const writer = await getAuthenticatedWriter();
  if (!writer) return NextResponse.json({ error: "Writer access is required." }, { status: 403 });
  const { id, chapterId } = await params;

  const existingChapter = await prisma.chapter.findFirst({
    where: {
      id: chapterId,
      workId: id,
      work: { authorId: writer.id },
    },
  });

  if (!existingChapter) return NextResponse.json({ error: "Chapter not found." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid chapter update request." }, { status: 400 });
  }

  const parsed = chapterSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Chapter title and content are required." }, { status: 400 });

  const status = parsed.data.submit ? "PENDING" : "DRAFT";

  const updatedChapter = await prisma.chapter.update({
    where: { id: chapterId },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl !== undefined ? parsed.data.imageUrl : existingChapter.imageUrl,
      imageColor: parsed.data.imageColor ?? existingChapter.imageColor,
      imageTemplate: parsed.data.imageTemplate ?? existingChapter.imageTemplate,
      status,
      submittedAt: parsed.data.submit ? new Date() : (parsed.data.submit === false ? null : existingChapter.submittedAt),
      reviewNote: parsed.data.submit ? null : existingChapter.reviewNote,
    },
  });

  return NextResponse.json({ chapter: updatedChapter });
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const writer = await getAuthenticatedWriter();
  if (!writer) return NextResponse.json({ error: "Writer access is required." }, { status: 403 });
  const { id, chapterId } = await params;

  const existingChapter = await prisma.chapter.findFirst({
    where: {
      id: chapterId,
      workId: id,
      work: { authorId: writer.id },
    },
  });

  if (!existingChapter) return NextResponse.json({ error: "Chapter not found." }, { status: 404 });

  await prisma.chapter.delete({ where: { id: chapterId } });
  return NextResponse.json({ ok: true });
}

