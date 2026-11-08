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

const workSchema = z.object({
  type: z.enum(["STORY", "POETRY", "SONG"]),
  storyFormat: z.enum(["SINGLE", "SERIAL"]).nullable().optional(),
  title: z.string().trim().min(2, "Title must be at least 2 characters.").max(120, "Title cannot exceed 120 characters."),
  description: z.string().trim().min(10, "Description must be at least 10 characters.").max(1000, "Description cannot exceed 1000 characters."),
  genre: z.string().trim().min(2, "Genre must be at least 2 characters.").max(40, "Genre cannot exceed 40 characters."),
  content: z.string().trim().max(100_000).nullable().optional(),
  chapter1Title: z.string().trim().max(120).nullable().optional(),
  chapter1Content: z.string().trim().max(100_000).nullable().optional(),
  coverImageUrl: imageDataUrl.nullable().optional(),
  coverColor: hexColor.nullable().optional(),
  coverTemplate: z.string().refine(isArtworkTemplate).nullable().optional(),
  submit: z.boolean().optional(),
});

async function getWriter() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true, role: true },
  });
  return user?.role === "WRITER" ? user : null;
}

export async function GET() {
  const writer = await getWriter();
  if (!writer) return NextResponse.json({ error: "Writer access is required." }, { status: 403 });
  const works = await prisma.work.findMany({
    where: { authorId: writer.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, type: true, title: true, description: true, genre: true, status: true, updatedAt: true, chapters: { orderBy: { chapterNo: "asc" }, select: { id: true, chapterNo: true, title: true, status: true } } },
  });
  return NextResponse.json({ works });
}

export async function POST(request: Request) {
  const writer = await getWriter();
  if (!writer) return NextResponse.json({ error: "Writer access is required." }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid work request." }, { status: 400 });
  }
  const parsed = workSchema.safeParse(body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).filter(Boolean).join(". ");
    return NextResponse.json({ error: errorMsg || "Please fill in all required fields correctly." }, { status: 400 });
  }
  const status = parsed.data.submit ? "PENDING" : "DRAFT";
  const isSingleChapter = parsed.data.type === "STORY" && parsed.data.storyFormat === "SINGLE";
  const hasChapterContent = Boolean(parsed.data.content?.trim() || parsed.data.chapter1Content?.trim());
  const initialChapterContent = (parsed.data.chapter1Content?.trim() || parsed.data.content?.trim()) || "";
  const initialChapterTitle = parsed.data.chapter1Title?.trim() || (isSingleChapter ? parsed.data.title : "පරිච්ඡේදය 1");

  const work = await prisma.work.create({
    data: {
      authorId: writer.id,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      genre: parsed.data.genre,
      content: isSingleChapter ? (initialChapterContent || null) : (parsed.data.type !== "STORY" ? (parsed.data.content || null) : null),
      coverImageUrl: parsed.data.coverImageUrl ?? null,
      coverColor: parsed.data.coverColor ?? "#334c50",
      coverTemplate: parsed.data.coverTemplate ?? "midnight",
      status,
      submittedAt: parsed.data.submit ? new Date() : null,
    },
    select: { id: true },
  });

  // If this is a story and chapter content was provided (either single-chapter or initial Chapter 1 in series):
  if (parsed.data.type === "STORY" && (isSingleChapter || hasChapterContent)) {
    await prisma.chapter.create({
      data: {
        workId: work.id,
        chapterNo: 1,
        title: initialChapterTitle,
        content: initialChapterContent || "කතාවේ අන්තර්ගතය",
        imageUrl: parsed.data.coverImageUrl ?? null,
        imageColor: parsed.data.coverColor ?? "#334c50",
        imageTemplate: parsed.data.coverTemplate ?? "midnight",
        status,
        submittedAt: parsed.data.submit ? new Date() : null,
      },
    });
  }

  return NextResponse.json({ work }, { status: 201 });
}
