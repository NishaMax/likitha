import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const workSchema = z.object({
  type: z.enum(["STORY", "POETRY", "SONG"]),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(1000),
  genre: z.string().trim().min(2).max(40),
  content: z.string().trim().max(100_000).optional(),
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
  if (!parsed.success) return NextResponse.json({ error: "Complete all fields before saving." }, { status: 400 });
  const status = parsed.data.submit ? "PENDING" : "DRAFT";
  const work = await prisma.work.create({
    data: {
      authorId: writer.id,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      genre: parsed.data.genre,
      content: parsed.data.content || null,
      status,
      submittedAt: parsed.data.submit ? new Date() : null,
    },
    select: { id: true },
  });
  return NextResponse.json({ work }, { status: 201 });
}
