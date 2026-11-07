import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ username: z.string().trim().min(1).max(120) });

export async function GET(request: Request) {
  const session = await auth();
  const username = new URL(request.url).searchParams.get("username");
  if (!username) return NextResponse.json({ error: "Username is required." }, { status: 400 });
  const writer = await prisma.user.findUnique({ where: { username }, select: { id: true, followersCount: true } });
  if (!writer) return NextResponse.json({ error: "Writer not found." }, { status: 404 });
  let following = false;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() }, select: { id: true } });
    if (user) following = Boolean(await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: user.id, followingId: writer.id } } }));
  }
  return NextResponse.json({ following, followers: writer.followersCount });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Sign in to follow writers." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid writer." }, { status: 400 });
  const [user, writer] = await Promise.all([
    prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() }, select: { id: true } }),
    prisma.user.findUnique({ where: { username: parsed.data.username }, select: { id: true } }),
  ]);
  if (!user || !writer) return NextResponse.json({ error: "Writer not found." }, { status: 404 });
  if (user.id === writer.id) return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });
  const existing = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: user.id, followingId: writer.id } } });
  if (existing) {
    await prisma.$transaction([prisma.follow.delete({ where: { id: existing.id } }), prisma.user.update({ where: { id: writer.id }, data: { followersCount: { decrement: 1 } } })]);
  } else {
    await prisma.$transaction([prisma.follow.create({ data: { followerId: user.id, followingId: writer.id } }), prisma.user.update({ where: { id: writer.id }, data: { followersCount: { increment: 1 } } })]);
  }
  return GET(new Request(new URL(`/api/follow?username=${encodeURIComponent(parsed.data.username)}`, request.url)));
}
