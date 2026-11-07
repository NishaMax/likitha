import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/dashboard/DashboardNav";
import NotificationList from "@/components/notifications/NotificationList";

export default function NotificationsPage() {
  return <Suspense fallback={<main className="min-h-screen" />}><NotificationsContent /></Suspense>;
}

async function NotificationsContent() {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth?mode=login");
  const user = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { role: true, notifications: { orderBy: { createdAt: "desc" }, take: 50 } },
  });
  if (!user) redirect("/auth?mode=login");
  return (
    <main className="min-h-screen">
      <DashboardNav role={user.role} />
      <section className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
        <Link href="/dashboard" className="text-sm text-[#9ba5c0] hover:text-[#e8ecf4]">← Dashboard</Link>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Your updates</p>
        <h1 className="mt-4 font-serif text-4xl text-[#e8ecf4]">Notifications</h1>
        <NotificationList notifications={user.notifications.map((notification) => ({ ...notification, createdAt: notification.createdAt.toISOString() }))} />
      </section>
    </main>
  );
}
