import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { stories } from "@/lib/stories";
import PublicNav from "@/components/navigation/PublicNav";
import ReadingProgressButton from "@/components/reading/ReadingProgressButton";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";

export function generateStaticParams() {
  return stories.map((story) => ({
    id: story.id,
    chapterNumber: "1",
  }));
}

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
  const sampleStory = stories.find((item) => item.id === id);
  const number = Number(chapterNumber);
  const databaseChapter = sampleStory ? null : await prisma.chapter.findFirst({
    where: { chapterNo: number, status: "APPROVED", work: { id, type: "STORY", status: "APPROVED" } },
    select: {
      chapterNo: true,
      title: true,
      content: true,
      work: { select: { id: true, title: true, author: { select: { displayName: true } }, chapters: { where: { status: "APPROVED" }, select: { chapterNo: true } } } },
    },
  });

  if ((!sampleStory && !databaseChapter) || !Number.isInteger(number) || number < 1 || (sampleStory && number > sampleStory.chapters)) notFound();
  if (databaseChapter) {
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
          <div className="mt-10 whitespace-pre-line font-sinhala text-lg leading-[2] text-[#d2d7e2]">{databaseChapter.content}</div>
          <div className="mt-14 flex items-center justify-between border-t border-[#252d40] pt-6">
            <span className="text-sm text-[#6f7890]">Chapter {number} of {totalChapters}</span>
            {number < totalChapters ? <Link href={`/story/${id}/chapter/${number + 1}`} className="flex min-h-11 items-center rounded-lg bg-[#c8a96e] px-4 text-sm font-semibold text-[#0f1117]">Next chapter →</Link> : <ReadingProgressButton workId={id} workType="STORY" chapterNumber={number} totalChapters={totalChapters} />}
          </div>
        </article>
      </main>
    );
  }
  const story = sampleStory!;

  return (
    <main className="min-h-screen">
      <PublicNav />

      <article className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
        <Link href="/browse" className="mb-8 inline-flex min-h-11 items-center rounded-lg border border-[#30384e] px-4 text-sm text-[#9ba5c0] transition hover:border-[#c8a96e]/60 hover:text-[#e8ecf4]">
          ← Back to stories
        </Link>
        <div className="border-b border-[#252d40] pb-8">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">{story.title} · Chapter {number}</p>
          <h1 className="mt-5 font-sinhala text-3xl font-bold leading-relaxed text-[#e8ecf4] sm:text-4xl">පළමු හමුවීම</h1>
          <p className="mt-3 text-sm text-[#6f7890]">by {story.author} · 8 min read</p>
        </div>

        <div className="font-sinhala mt-10 text-lg leading-[2] text-[#d2d7e2]">
          <p>වැස්ස වැටෙන්න පටන් ගත්තේ හවස පහට විතර. නගරයේ කලබලය මැද, ඇය ජනේලය ළඟ නතර වෙලා බලාගෙන හිටියා.</p>
          <p className="mt-7">කාලයක් තිස්සේ අමතක කරන්න උත්සාහ කළ මතකයක්, ඒ වැස්සත් එක්ක ආයෙත් ඇගේ හිතට ආවා. සමහර කතා අවසන් වෙන්නේ නැහැ. ඒවා අපි තුළම තව දුරටත් ජීවත් වෙනවා.</p>
          <p className="mt-7">ඒ මොහොතේ දොරට තට්ටු කරන හඬක් ඇසුණා. ඇය හුස්මක් ගෙන, දොර වෙත සෙමින් ඇවිද ගියා.</p>
        </div>

        <div className="mt-14 flex items-center justify-between border-t border-[#252d40] pt-6">
          <span className="text-sm text-[#6f7890]">Chapter {number} of {story.chapters}</span>
          {number < story.chapters ? (
            <div className="flex flex-col items-end gap-3">
              <ReadingProgressButton workId={story.id} workType="STORY" chapterNumber={number} totalChapters={story.chapters} autoTrack />
              <Link href={`/story/${story.id}/chapter/${number + 1}`} className="flex min-h-11 items-center rounded-lg bg-[#c8a96e] px-4 text-sm font-semibold text-[#0f1117]">
                Next chapter →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-3">
              <ReadingProgressButton workId={story.id} workType="STORY" chapterNumber={number} totalChapters={story.chapters} />
              <Link href={`/story/${story.id}`} className="flex min-h-11 items-center rounded-lg border border-[#30384e] px-4 text-sm font-semibold text-[#c8a96e]">
                Back to story
              </Link>
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
