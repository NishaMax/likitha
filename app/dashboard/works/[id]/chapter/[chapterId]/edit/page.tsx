import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import ChapterForm from "@/components/publishing/ChapterForm";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string; chapterId: string }> };

export default function EditChapterPage({ params }: Props) {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <EditChapterContent params={params} />
    </Suspense>
  );
}

async function EditChapterContent({ params }: Props) {
  const session = await auth();
  const { id, chapterId } = await params;
  if (!session?.user?.email) redirect("/auth?mode=login");

  const writer = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true, role: true },
  });
  if (!writer || writer.role !== "WRITER") redirect("/dashboard");

  const chapter = await prisma.chapter.findFirst({
    where: {
      id: chapterId,
      workId: id,
      work: { authorId: writer.id },
    },
    include: {
      work: { select: { id: true, title: true } },
    },
  });

  if (!chapter) notFound();

  const initialChapter = {
    id: chapter.id,
    chapterNo: chapter.chapterNo,
    title: chapter.title,
    content: chapter.content,
    imageUrl: chapter.imageUrl,
    imageColor: chapter.imageColor,
    imageTemplate: chapter.imageTemplate,
    status: chapter.status,
    reviewNote: chapter.reviewNote,
  };

  return (
    <main className="min-h-screen">
      <DashboardNav role="WRITER" />
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
        <Link href={`/dashboard/works/${id}`} className="inline-flex items-center text-sm text-[#9ba5c0] hover:text-[#e8ecf4]">
          ← Back to {chapter.work.title}
        </Link>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Chapter editor</p>
          <h1 className="mt-2 font-serif text-4xl text-[#e8ecf4]">
            Edit Chapter {chapter.chapterNo}.
          </h1>
          <p className="mt-2 text-sm text-[#9ba5c0]">
            Update your text, artwork, or submit this chapter for admin approval.
          </p>
        </div>
        <div className="mt-8">
          <ChapterForm workId={id} initialChapter={initialChapter} />
        </div>
      </section>
    </main>
  );
}

