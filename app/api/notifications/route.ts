import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const actionSchema = z.object({
  notificationId: z.string().min(1).optional(),
  action: z.enum(["read", "readAll"]),
});

async function getUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true },
  });
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in to view notifications." }, { status: 401 });
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({
    notifications,
    unread: notifications.filter((notification) => !notification.isRead).length,
  });
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in to update notifications." }, { status: 401 });
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || (parsed.data.action === "read" && !parsed.data.notificationId)) {
    return NextResponse.json({ error: "Invalid notification action." }, { status: 400 });
  }
  if (parsed.data.action === "readAll") {
    await prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
  } else {
    await prisma.notification.updateMany({
      where: { id: parsed.data.notificationId, userId: user.id },
      data: { isRead: true },
    });
  }
  return NextResponse.json({ ok: true });
}
