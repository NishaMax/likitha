import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const actionSchema = z.object({
  commentId: z.string().min(1),
  action: z.enum(["hide", "unhide", "delete"]),
});

export async function GET() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      content: true,
      isHidden: true,
      createdAt: true,
      user: { select: { displayName: true, email: true } },
      workId: true,
    },
  });
  return NextResponse.json({ comments });
}

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid moderation request." }, { status: 400 });
  }
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid moderation action." }, { status: 400 });

  if (parsed.data.action === "delete") {
    const result = await prisma.comment.deleteMany({ where: { id: parsed.data.commentId } });
    if (result.count === 0) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  } else {
    const result = await prisma.comment.updateMany({
      where: { id: parsed.data.commentId },
      data: { isHidden: parsed.data.action === "hide" },
    });
    if (result.count === 0) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
