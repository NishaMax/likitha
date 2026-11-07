import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const rl = readline.createInterface({ input, output });
const prisma = new PrismaClient();

function readHidden(prompt) {
  return new Promise((resolve) => {
    output.write(prompt);
    if (!input.isTTY) {
      input.once("data", (chunk) => resolve(chunk.toString().trim()));
      return;
    }
    input.setRawMode(true);
    input.resume();
    let value = "";
    const onData = (chunk) => {
      const character = chunk.toString();
      if (character === "\r" || character === "\n") {
        input.setRawMode(false);
        input.pause();
        input.off("data", onData);
        output.write("\n");
        resolve(value);
      } else if (character === "\u0003") {
        process.exit(1);
      } else if (character === "\u007f") {
        value = value.slice(0, -1);
      } else {
        value += character;
      }
    };
    input.on("data", onData);
  });
}

try {
  const email = (await rl.question("Admin email: ")).trim().toLowerCase();
  const password = await readHidden("Admin password: ");
  if (!email || password.length < 8) throw new Error("Email and password must be valid.");
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { passwordHash, role: "ADMIN", isBanned: false, profileComplete: true } });
  } else {
    const username = `admin-${crypto.randomUUID().slice(0, 8)}`;
    await prisma.user.create({ data: { email, username, displayName: "Likitha Admin", passwordHash, role: "ADMIN", isVerified: true, profileComplete: true } });
  }
  console.log("Admin account provisioned. Use /admin/login.");
} finally {
  rl.close();
  await prisma.$disconnect();
}
