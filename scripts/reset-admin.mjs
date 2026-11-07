import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = (process.env.ADMIN_EMAIL || "nishantha0426@gmail.com").trim().toLowerCase();
const temporaryPassword = `Likitha-${crypto.randomBytes(9).toString("base64url")}`;

try {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) throw new Error(`No account found for ${email}.`);

  const passwordHash = await bcrypt.hash(temporaryPassword, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, role: "ADMIN", isBanned: false, profileComplete: true },
    }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);

  console.log(`Admin password reset for ${email}.`);
  console.log(`Temporary password: ${temporaryPassword}`);
  console.log("Use it at http://localhost:3000/admin/login, then change it after signing in.");
} finally {
  await prisma.$disconnect();
}
