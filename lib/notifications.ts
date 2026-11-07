import { prisma } from "@/lib/prisma";

export async function createNotification(
  userId: string,
  type: string,
  message: string,
  href?: string,
) {
  return prisma.notification.create({ data: { userId, type, message, href } });
}
