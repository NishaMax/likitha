import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  bio: z.string().trim().max(500).optional(),
  avatarUrl: z.string().regex(/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/).max(1_400_000).nullable().optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Check your display name, bio, and avatar file." }, { status: 400 });
  }

  if (!parsed.data.displayName && parsed.data.bio === undefined && parsed.data.avatarUrl === undefined) {
    return NextResponse.json({ error: "Add at least one profile change." }, { status: 400 });
  }

  await prisma.user.update({
    where: { email: session.user.email.toLowerCase() },
    data: {
      ...(parsed.data.displayName ? { displayName: parsed.data.displayName, name: parsed.data.displayName } : {}),
      ...(parsed.data.bio !== undefined ? { bio: parsed.data.bio || null } : {}),
      ...(parsed.data.avatarUrl !== undefined ? { avatarUrl: parsed.data.avatarUrl } : {}),
      profileComplete: true,
    },
  });

  return NextResponse.json({ ok: true });
}
