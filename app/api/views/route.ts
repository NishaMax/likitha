import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recordStoryView } from "@/lib/tier";

const schema = z.object({
  workId: z.string().trim().min(1).max(120),
  sessionId: z.string().trim().min(16).max(100),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid view request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid view request." }, { status: 400 });
  const work = await prisma.work.findFirst({
    where: { id: parsed.data.workId, status: "APPROVED" },
    select: { authorId: true },
  });
  if (!work) return NextResponse.json({ recorded: false });
  const date = new Date().toISOString().slice(0, 10);
  return NextResponse.json(await recordStoryView(work.authorId, parsed.data.workId, parsed.data.sessionId, date));
}
