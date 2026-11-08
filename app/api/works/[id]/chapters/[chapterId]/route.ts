import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isArtworkTemplate } from "@/lib/artwork";

const imageDataUrl = z.string().refine((val) => {
  if (!val) return true;
  return val.startsWith("data:image/") || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/");
}, { message: "Choose a valid image format." }).max(3_500_000, "Image size is too large.");

const chapterSchema = z.object({
  title: z.string().trim().min(2, "Chapter title must be at least 2 characters.").max(120, "Chapter title cannot exceed 120 characters."),
  content: z.string().trim().min(20, "Chapter content must be at least 20 characters.").max(100_000),
  imageUrl: imageDataUrl.nullable().optional(),
  imageColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
  imageTemplate: z.string().refine(isArtworkTemplate).nullable().optional(),
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
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).filter(Boolean).join(". ");
    return NextResponse.json({ error: errorMsg || "Chapter title and content are required." }, { status: 400 });
  }

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

