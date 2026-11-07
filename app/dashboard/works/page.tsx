import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { prisma } from "@/lib/prisma";

export default function WriterWorksPage() {
  return <Suspense fallback={<main className="min-h-screen" />}><WriterWorksContent /></Suspense>;
}

async function WriterWorksContent() {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth?mode=login");
  const writer = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() }, select: { id: true, role: true } });
  if (!writer || writer.role !== "WRITER") redirect("/dashboard");
  const works = await prisma.work.findMany({ where: { authorId: writer.id }, orderBy: { updatedAt: "desc" }, select: { id: true, title: true, type: true, status: true, chapters: { select: { id: true, chapterNo: true, title: true, status: true }, orderBy: { chapterNo: "asc" } } } });

  return (
    <main className="min-h-screen">
      <DashboardNav role="WRITER" />
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Writer studio</p><h1 className="mt-4 font-serif text-4xl text-[#e8ecf4]">Your works</h1><p className="mt-3 text-sm text-[#9ba5c0]">Create, edit, and submit your stories, poetry, and songs.</p></div>
          <Link href="/dashboard/story/new" className="inline-flex min-h-12 items-center rounded-lg bg-[#c8a96e] px-5 font-semibold text-[#0f1117]">Create new →</Link>
        </div>
        {works.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2">{works.map((work) => <Link key={work.id} href={`/dashboard/works/${work.id}`} className="rounded-2xl border border-[#252d40] bg-[#171b26] p-5 hover:border-[#c8a96e]/50"><div className="flex items-center justify-between gap-3"><span className="text-xs uppercase tracking-[.15em] text-[#c8a96e]">{work.type}</span><span className="rounded-full border border-[#30384e] px-3 py-1 text-xs text-[#9ba5c0]">{work.status}</span></div><h2 className="mt-5 font-sinhala text-xl text-[#e8ecf4]">{work.title}</h2><p className="mt-3 text-sm text-[#6f7890]">{work.type === "STORY" ? `${work.chapters.length} chapters` : "Single work"}</p></Link>)}</div> : <div className="mt-8 rounded-2xl border border-dashed border-[#30384e] p-10 text-center"><p className="text-[#9ba5c0]">You have not created a work yet.</p><Link href="/dashboard/story/new" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[#c8a96e] px-4 text-sm font-semibold text-[#0f1117]">Create your first work</Link></div>}
      </section>
    </main>
  );
}
