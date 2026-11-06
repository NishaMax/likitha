import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(60),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Display name must be 2–60 characters." }, { status: 400 });
  }

  await prisma.user.update({
    where: { email: session.user.email.toLowerCase() },
    data: {
      displayName: parsed.data.displayName,
      name: parsed.data.displayName,
      profileComplete: true,
    },
  });

  return NextResponse.json({ ok: true });
}
