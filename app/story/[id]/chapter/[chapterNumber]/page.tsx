import Link from "next/link";
import { notFound } from "next/navigation";
import { stories } from "@/lib/stories";

export function generateStaticParams() {
  return stories.map((story) => ({
    id: story.id,
    chapterNumber: "1",
  }));
}

type ChapterPageProps = {
  params: Promise<{ id: string; chapterNumber: string }>;
};

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { id, chapterNumber } = await params;
  const story = stories.find((item) => item.id === id);
  const number = Number(chapterNumber);

  if (!story || !Number.isInteger(number) || number < 1 || number > story.chapters) notFound();

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="font-serif text-2xl tracking-tight text-[#e8ecf4]" aria-label="Likitha home">
          likitha<span className="text-[#c8a96e]">.</span>
        </Link>
        <Link href={`/story/${story.id}`} className="flex min-h-11 items-center rounded-full px-3 text-sm text-[#9ba5c0] transition hover:text-[#e8ecf4]">
          ← Story
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
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
            <Link href={`/story/${story.id}/chapter/${number + 1}`} className="flex min-h-11 items-center rounded-lg bg-[#c8a96e] px-4 text-sm font-semibold text-[#0f1117]">
              Next chapter →
            </Link>
          ) : (
            <Link href={`/story/${story.id}`} className="flex min-h-11 items-center rounded-lg border border-[#30384e] px-4 text-sm font-semibold text-[#c8a96e]">
              Back to story
            </Link>
          )}
        </div>
      </article>
    </main>
  );
}
