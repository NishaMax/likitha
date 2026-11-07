import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const actionSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(["ban", "unban"]),
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
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid user action." }, { status: 400 });
  if (parsed.data.userId === admin.id) return NextResponse.json({ error: "You cannot ban your own admin account." }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true, role: true } });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (target.role === "ADMIN") return NextResponse.json({ error: "Admin accounts cannot be changed here." }, { status: 403 });

  const isBanned = parsed.data.action === "ban";
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: target.id }, data: { isBanned } });
    if (isBanned) await tx.session.deleteMany({ where: { userId: target.id } });
  });
  return NextResponse.json({ ok: true, isBanned });
}
