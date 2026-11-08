import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PublicNav from "@/components/navigation/PublicNav";
import ReadingProgressButton from "@/components/reading/ReadingProgressButton";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";

type ChapterPageProps = {
  params: Promise<{ id: string; chapterNumber: string }>;
};

export default function ChapterPage({ params }: ChapterPageProps) {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <ChapterPageContent params={params} />
    </Suspense>
  );
}

async function ChapterPageContent({ params }: ChapterPageProps) {
  await connection();
  const { id, chapterNumber } = await params;
  const number = Number(chapterNumber);
  const databaseChapter = await prisma.chapter.findFirst({
    where: { chapterNo: number, status: "APPROVED", work: { id, type: "STORY", status: "APPROVED" } },
    select: {
      chapterNo: true,
      title: true,
      content: true,
      imageUrl: true,
      imageColor: true,
      imageTemplate: true,
      work: { select: { id: true, title: true, author: { select: { displayName: true } }, chapters: { where: { status: "APPROVED" }, select: { chapterNo: true } } } },
    },
  });

  if (!databaseChapter || !Number.isInteger(number) || number < 1) notFound();
  {
    const totalChapters = databaseChapter.work.chapters.length;
    return (
      <main className="min-h-screen">
        <PublicNav />
        <article className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
          <Link href={`/story/${id}`} className="mb-8 inline-flex min-h-11 items-center rounded-lg border border-[#30384e] px-4 text-sm text-[#9ba5c0] transition hover:border-[#c8a96e]/60 hover:text-[#e8ecf4]">← Back to story</Link>
          <div className="border-b border-[#252d40] pb-8">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">{databaseChapter.work.title} · Chapter {number}</p>
            <h1 className="mt-5 font-sinhala text-3xl font-bold leading-relaxed text-[#e8ecf4] sm:text-4xl">{databaseChapter.title}</h1>
            <p className="mt-3 text-sm text-[#6f7890]">by {databaseChapter.work.author.displayName}</p>
          </div>
          {databaseChapter.imageUrl && <Image src={databaseChapter.imageUrl} alt="" width={900} height={420} className="mt-8 max-h-[28rem] w-full rounded-2xl object-cover" unoptimized />}
          <div className="mt-10 whitespace-pre-line font-sinhala text-lg leading-[2] text-[#d2d7e2]">{databaseChapter.content}</div>
          <div className="mt-14 flex items-center justify-between border-t border-[#252d40] pt-6">
            <span className="text-sm text-[#6f7890]">Chapter {number} of {totalChapters}</span>
            {number < totalChapters ? <Link href={`/story/${id}/chapter/${number + 1}`} className="flex min-h-11 items-center rounded-lg bg-[#c8a96e] px-4 text-sm font-semibold text-[#0f1117]">Next chapter →</Link> : <ReadingProgressButton workId={id} workType="STORY" chapterNumber={number} totalChapters={totalChapters} />}
          </div>
        </article>
      </main>
    );
  }
}
