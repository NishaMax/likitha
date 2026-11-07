import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/dashboard/DashboardNav";
import ReviewQueue from "@/components/admin/ReviewQueue";
import CommentModeration from "@/components/admin/CommentModeration";
import UserManagement from "@/components/admin/UserManagement";

export default function AdminReviewsPage() {
  return <Suspense fallback={<main className="min-h-screen" />}><AdminReviewsContent /></Suspense>;
}

async function AdminReviewsContent() {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth?mode=login");
  const admin = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() }, select: { role: true } });
  if (admin?.role !== "ADMIN") redirect("/dashboard");

  const [works, chapters, comments, users] = await Promise.all([
    prisma.work.findMany({ where: { status: "PENDING" }, orderBy: { submittedAt: "asc" }, select: { id: true, type: true, title: true, description: true, content: true, submittedAt: true, author: { select: { displayName: true } } } }),
    prisma.chapter.findMany({ where: { status: "PENDING" }, orderBy: { submittedAt: "asc" }, select: { id: true, chapterNo: true, title: true, content: true, submittedAt: true, work: { select: { title: true, author: { select: { displayName: true } } } } } }),
    prisma.comment.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, content: true, isHidden: true, createdAt: true, workId: true, user: { select: { displayName: true, email: true } } } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 200, select: { id: true, email: true, displayName: true, username: true, role: true, tier: true, isBanned: true, createdAt: true, _count: { select: { works: true, comments: true } } } }),
  ]);

  return <main className="min-h-screen"><DashboardNav role="ADMIN" /><section className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:px-10"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Admin review</p><h1 className="mt-4 font-serif text-4xl text-[#e8ecf4]">Approval queue.</h1><p className="mt-3 max-w-xl text-sm leading-7 text-[#9ba5c0]">Review writer submissions, manage users, and keep community discussions healthy.</p><div className="mt-10"><ReviewQueue works={works.map((item) => ({ ...item, author: item.author.displayName, submittedAt: item.submittedAt?.toISOString() ?? null }))} chapters={chapters.map((item) => ({ ...item, workTitle: item.work.title, author: item.work.author.displayName, submittedAt: item.submittedAt?.toISOString() ?? null }))} /><CommentModeration comments={comments.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))} /><UserManagement users={users.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))} /></div></section></main>;
}
