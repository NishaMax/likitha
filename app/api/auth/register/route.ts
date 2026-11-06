import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registrationSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  role: z.enum(["READER", "WRITER"]),
});

export async function POST(request: Request) {
  const parsed = registrationSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your details." }, { status: 400 });
  }

  const { displayName, email, password, role } = parsed.data;
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json(
      { error: "This email already has a Likitha account. One email can have one account type." },
      { status: 409 },
    );
  }

  const usernameBase = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24) || "likitha-user";
  const username = `${usernameBase}-${crypto.randomUUID().slice(0, 8)}`;
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      displayName,
      email,
      username,
      passwordHash,
      role,
      isVerified: false,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
