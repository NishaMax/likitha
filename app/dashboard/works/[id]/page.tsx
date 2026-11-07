import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default function WriterWorkPage({ params }: Props) {
  return <Suspense fallback={<main className="min-h-screen" />}><WriterWorkContent params={params} /></Suspense>;
}

async function WriterWorkContent({ params }: Props) {
  const session = await auth();
  const { id } = await params;
  if (!session?.user?.email) redirect("/auth?mode=login");
  const writer = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() }, select: { id: true, role: true } });
  if (!writer || writer.role !== "WRITER") redirect("/dashboard");
  const work = await prisma.work.findFirst({ where: { id, authorId: writer.id }, select: { id: true, title: true, type: true, description: true, genre: true, status: true, chapters: { orderBy: { chapterNo: "asc" }, select: { id: true, chapterNo: true, title: true, status: true } } } });
  if (!work) notFound();

  return <main className="min-h-screen"><DashboardNav role="WRITER" /><section className="mx-auto max-w-4xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16"><Link href="/dashboard/works" className="text-sm text-[#9ba5c0] hover:text-[#e8ecf4]">← All works</Link><div className="mt-6 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[.15em] text-[#c8a96e]">{work.type} · {work.genre}</p><h1 className="mt-3 font-sinhala text-4xl text-[#e8ecf4]">{work.title}</h1><p className="mt-3 max-w-xl text-sm leading-7 text-[#9ba5c0]">{work.description}</p></div><span className="rounded-full border border-[#30384e] px-3 py-2 text-xs text-[#c8a96e]">{work.status}</span></div>{work.type === "STORY" && <div className="mt-10"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl text-[#e8ecf4]">Chapters</h2><Link href={`/dashboard/works/${work.id}/chapter/new`} className="min-h-11 rounded-lg bg-[#c8a96e] px-4 py-3 text-sm font-semibold text-[#0f1117]">Add chapter</Link></div>{work.chapters.length ? <div className="mt-4 divide-y divide-[#252d40] rounded-xl border border-[#252d40] bg-[#171b26] px-4">{work.chapters.map((chapter) => <div key={chapter.id} className="flex min-h-16 items-center justify-between gap-4 py-3"><span className="text-sm text-[#e8ecf4]">Chapter {chapter.chapterNo}: {chapter.title}</span><span className="text-xs text-[#9ba5c0]">{chapter.status}</span></div>)}</div> : <p className="mt-4 text-sm text-[#6f7890]">Add your first chapter to continue.</p>}</div>}</section></main>;
}
