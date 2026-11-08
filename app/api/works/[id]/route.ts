import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isArtworkTemplate } from "@/lib/artwork";

const imageDataUrl = z.string().refine((val) => {
  if (!val) return true;
  return val.startsWith("data:image/") || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/");
}, { message: "Choose a valid image format." }).max(3_500_000, "Image size is too large.");

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const updateWorkSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters.").max(120, "Title cannot exceed 120 characters.").optional(),
  description: z.string().trim().min(10, "Description must be at least 10 characters.").max(1000, "Description cannot exceed 1000 characters.").optional(),
  genre: z.string().trim().min(2, "Genre must be at least 2 characters.").max(40, "Genre cannot exceed 40 characters.").optional(),
  content: z.string().trim().max(100_000).nullable().optional(),
  coverImageUrl: imageDataUrl.nullable().optional(),
  coverColor: hexColor.nullable().optional(),
  coverTemplate: z.string().refine(isArtworkTemplate).nullable().optional(),
  submit: z.boolean().optional(),
  action: z.enum(["hide", "unpublish"]).optional(),
});

type RouteProps = { params: Promise<{ id: string }> };

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
  const { id } = await params;

  const work = await prisma.work.findFirst({
    where: { id, authorId: writer.id },
    include: {
      chapters: { orderBy: { chapterNo: "asc" } },
    },
  });

  if (!work) return NextResponse.json({ error: "Work not found." }, { status: 404 });
  return NextResponse.json({ work });
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const writer = await getAuthenticatedWriter();
  if (!writer) return NextResponse.json({ error: "Writer access is required." }, { status: 403 });
  const { id } = await params;

  const existingWork = await prisma.work.findFirst({
    where: { id, authorId: writer.id },
    include: { chapters: { orderBy: { chapterNo: "asc" } } },
  });

  if (!existingWork) return NextResponse.json({ error: "Work not found." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid update request." }, { status: 400 });
  }

  const parsed = updateWorkSchema.safeParse(body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).filter(Boolean).join(". ");
    return NextResponse.json({ error: errorMsg || "Complete all required fields correctly." }, { status: 400 });
  }

  // Handle hiding / unpublishing an approved work
  if (parsed.data.action === "hide" || parsed.data.action === "unpublish") {
    await prisma.$transaction([
      prisma.work.update({
        where: { id },
        data: { status: "DRAFT" },
      }),
      prisma.chapter.updateMany({
        where: { workId: id },
        data: { status: "DRAFT" },
      }),
    ]);
    return NextResponse.json({ work: { id, status: "DRAFT" } });
  }

  const status = parsed.data.submit ? "PENDING" : "DRAFT";
  const updatedWork = await prisma.work.update({
    where: { id },
    data: {
      title: parsed.data.title ?? existingWork.title,
      description: parsed.data.description ?? existingWork.description,
      genre: parsed.data.genre ?? existingWork.genre,
      content: parsed.data.content !== undefined ? parsed.data.content : existingWork.content,
      coverImageUrl: parsed.data.coverImageUrl !== undefined ? parsed.data.coverImageUrl : existingWork.coverImageUrl,
      coverColor: parsed.data.coverColor ?? existingWork.coverColor,
      coverTemplate: parsed.data.coverTemplate ?? existingWork.coverTemplate,
      status,
      submittedAt: parsed.data.submit ? new Date() : (parsed.data.submit === false ? null : existingWork.submittedAt),
      reviewNote: parsed.data.submit ? null : existingWork.reviewNote,
    },
    select: { id: true, status: true },
  });

  // If this story has a Chapter 1 (e.g. single-chapter story or initial chapter) and content was updated:
  if (existingWork.type === "STORY" && existingWork.chapters.length > 0) {
    const firstChapter = existingWork.chapters[0];
    const newContent = parsed.data.content?.trim();
    if (newContent) {
      await prisma.chapter.update({
        where: { id: firstChapter.id },
        data: {
          title: parsed.data.title ?? firstChapter.title,
          content: newContent,
          imageUrl: parsed.data.coverImageUrl !== undefined ? parsed.data.coverImageUrl : firstChapter.imageUrl,
          imageColor: parsed.data.coverColor ?? firstChapter.imageColor,
          imageTemplate: parsed.data.coverTemplate ?? firstChapter.imageTemplate,
          status,
          submittedAt: parsed.data.submit ? new Date() : (parsed.data.submit === false ? null : firstChapter.submittedAt),
          reviewNote: parsed.data.submit ? null : firstChapter.reviewNote,
        },
      });
    } else if (parsed.data.submit) {
      // If submitting and first chapter was DRAFT or REJECTED, submit chapter too
      if (firstChapter.status === "DRAFT" || firstChapter.status === "REJECTED") {
        await prisma.chapter.update({
          where: { id: firstChapter.id },
          data: {
            status: "PENDING",
            submittedAt: new Date(),
            reviewNote: null,
          },
        });
      }
    }
  } else if (existingWork.type === "STORY" && existingWork.chapters.length === 0 && parsed.data.content?.trim()) {
    // If it didn't have a chapter yet, create Chapter 1
    await prisma.chapter.create({
      data: {
        workId: existingWork.id,
        chapterNo: 1,
        title: parsed.data.title ?? existingWork.title,
        content: parsed.data.content.trim(),
        imageUrl: parsed.data.coverImageUrl ?? null,
        imageColor: parsed.data.coverColor ?? "#334c50",
        imageTemplate: parsed.data.coverTemplate ?? "midnight",
        status,
        submittedAt: parsed.data.submit ? new Date() : null,
      },
    });
  }

  return NextResponse.json({ work: updatedWork });
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const writer = await getAuthenticatedWriter();
  if (!writer) return NextResponse.json({ error: "Writer access is required." }, { status: 403 });
  const { id } = await params;

  const work = await prisma.work.findFirst({
    where: { id, authorId: writer.id },
  });

  if (!work) return NextResponse.json({ error: "Work not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.chapter.deleteMany({ where: { workId: id } }),
    prisma.comment.deleteMany({ where: { workId: id } }),
    prisma.workLike.deleteMany({ where: { workId: id } }),
    prisma.savedWork.deleteMany({ where: { workId: id } }),
    prisma.readingProgress.deleteMany({ where: { workId: id } }),
    prisma.work.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}

