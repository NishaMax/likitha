import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

const actionSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(["ban", "unban"]),
});

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      displayName: true,
      username: true,
      role: true,
      tier: true,
      isBanned: true,
      createdAt: true,
      _count: { select: { works: true, comments: true } },
    },
  });
  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid user action." }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true, role: true } });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const isBanned = parsed.data.action === "ban";
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: target.id }, data: { isBanned } });
    if (isBanned) await tx.session.deleteMany({ where: { userId: target.id } });
  });
  return NextResponse.json({ ok: true, isBanned });
}
