import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import ChapterForm from "@/components/publishing/ChapterForm";

type Props = { params: Promise<{ id: string }> };

export default function NewChapterPage({ params }: Props) {
  return <Suspense fallback={<main className="min-h-screen" />}><NewChapterContent params={params} /></Suspense>;
}

async function NewChapterContent({ params }: Props) {
  const session = await auth();
  const { id } = await params;
  if (!session?.user) redirect("/auth?mode=login");
  return <main className="min-h-screen"><DashboardNav role="WRITER" /><section className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Story editor</p><h1 className="mt-4 font-serif text-4xl text-[#e8ecf4]">Add a chapter.</h1><p className="mt-3 text-sm text-[#9ba5c0]">Save your work privately or submit it for admin approval.</p><div className="mt-8"><ChapterForm workId={id} /></div></section></main>;
}
