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

type RouteProps = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  const session = await auth();
  const { id } = await params;
  if (!session?.user?.email) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  const writer = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() }, select: { id: true, role: true } });
  if (!writer || writer.role !== "WRITER") return NextResponse.json({ error: "Writer access is required." }, { status: 403 });
  const work = await prisma.work.findFirst({ where: { id, authorId: writer.id, type: "STORY" }, select: { id: true, chapters: { select: { chapterNo: true } } } });
  if (!work) return NextResponse.json({ error: "Story not found." }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid chapter request." }, { status: 400 }); }
  const parsed = chapterSchema.safeParse(body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).filter(Boolean).join(". ");
    return NextResponse.json({ error: errorMsg || "Chapter title and content are required." }, { status: 400 });
  }
  const chapterNo = Math.max(0, ...work.chapters.map((chapter) => chapter.chapterNo)) + 1;
  const submit = parsed.data.submit === true;
  const chapter = await prisma.chapter.create({
    data: {
      workId: work.id,
      chapterNo,
      title: parsed.data.title,
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl ?? null,
      imageColor: parsed.data.imageColor ?? "#334c50",
      imageTemplate: parsed.data.imageTemplate ?? "midnight",
      status: submit ? "PENDING" : "DRAFT",
      submittedAt: submit ? new Date() : null,
    },
    select: { id: true, chapterNo: true },
  });
  return NextResponse.json({ chapter }, { status: 201 });
}
