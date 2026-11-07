import Link from "next/link";
import { notFound } from "next/navigation";
import { stories } from "@/lib/stories";
import PublicNav from "@/components/navigation/PublicNav";
import EngagementControls from "@/components/engagement/EngagementControls";
import CommentsSection from "@/components/engagement/CommentsSection";
import ViewTracker from "@/components/engagement/ViewTracker";

export function generateStaticParams() {
  return stories.map((story) => ({ id: story.id }));
}

type StoryPageProps = {
  params: Promise<{ id: string }>;
};

const chapterPreviews = [
  { number: 1, title: "පළමු හමුවීම", date: "2 days ago" },
  { number: 2, title: "වැස්සට පෙර", date: "5 days ago" },
  { number: 3, title: "මතක මාවත", date: "1 week ago" },
  { number: 4, title: "නොකියූ වචන", date: "1 week ago" },
  { number: 5, title: "අලුත් ආරම්භයක්", date: "2 weeks ago" },
];

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params;
  const story = stories.find((item) => item.id === id);

  if (!story) notFound();

  return (
    <main className="min-h-screen">
      <ViewTracker workId={story.id} />
      <PublicNav />

      <div className="mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8 lg:px-10">
        <Link href="/browse" className="inline-flex min-h-11 items-center rounded-lg border border-[#30384e] px-4 text-sm text-[#9ba5c0] transition hover:border-[#c8a96e]/60 hover:text-[#e8ecf4]">
          ← Back to stories
        </Link>
      </div>

      <section className="relative overflow-hidden border-y border-[#202638] bg-[#12151e]">
        <div className={`absolute inset-0 bg-gradient-to-br ${story.color} opacity-20`} />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-16 lg:grid-cols-[260px_1fr] lg:items-end lg:gap-12 lg:px-10">
          <div className={`flex h-72 items-end rounded-2xl bg-gradient-to-br ${story.color} p-6 shadow-2xl shadow-black/30 sm:h-96`}>
            <div>
              <span className="rounded-full bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[.15em] text-[#e9d8b7]">
                {story.genre}
              </span>
              <h1 className="mt-4 font-sinhala text-3xl font-bold leading-relaxed text-[#f4ead8]">{story.title}</h1>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Featured story</span>
            <h2 className="mt-4 font-serif text-4xl tracking-tight text-[#e8ecf4] sm:text-5xl">{story.title}</h2>
            <p className="mt-3 text-sm text-[#9ba5c0]">by {story.author}</p>
            <p className="mt-6 max-w-xl font-sinhala text-base leading-8 text-[#c4cada]">{story.description}</p>

            <div className="mt-6 flex flex-wrap gap-5 text-xs text-[#6f7890]">
              <span>{story.chapters} chapters</span>
              <span>{story.readers} readers</span>
              <span>Updated weekly</span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/story/${story.id}/chapter/1`} className="flex min-h-12 items-center justify-center rounded-lg bg-[#c8a96e] px-6 font-semibold text-[#0f1117] transition hover:bg-[#d9ba7d]">
                Start reading <span className="ml-2 text-lg">→</span>
              </Link>
              <EngagementControls workId={story.id} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
        <CommentsSection workId={story.id} />
      </div>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_280px] lg:px-10">
        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">The journey</p>
              <h2 className="mt-3 font-serif text-3xl text-[#e8ecf4]">Chapters</h2>
            </div>
            <span className="text-sm text-[#6f7890]">{story.chapters} total</span>
          </div>
          <div className="mt-6 divide-y divide-[#252d40] rounded-2xl border border-[#252d40] bg-[#171b26] px-4">
            {chapterPreviews.map((chapter) => (
              <Link key={chapter.number} href={`/story/${story.id}/chapter/${chapter.number}`} className="flex min-h-20 items-center gap-4 py-4 transition hover:text-[#c8a96e]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e2335] font-mono text-xs text-[#c8a96e]">{String(chapter.number).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-sinhala text-base text-[#e8ecf4]">{chapter.title}</span>
                  <span className="mt-1 block text-xs text-[#6f7890]">{chapter.date}</span>
                </span>
                <span className="text-[#6f7890]">→</span>
              </Link>
            ))}
            <div className="py-4 text-center text-xs text-[#6f7890]">More chapters coming soon</div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-[#252d40] bg-[#171b26] p-5">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">About the writer</p>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3b3544] font-serif text-lg text-[#e9d8b7]">{story.author.charAt(0)}</div>
            <div>
              <p className="font-sinhala text-sm font-bold text-[#e8ecf4]">{story.author}</p>
              <p className="mt-1 text-xs text-[#6f7890]">Silver writer</p>
            </div>
          </div>
          <p className="mt-5 font-sinhala text-sm leading-7 text-[#9ba5c0]">කතා කියන්න ආදරය කරන, මිනිස් හදවත් ගැන ලියන ලේඛිකාවක්.</p>
          <Link href={`/writer/${encodeURIComponent(story.author)}`} className="mt-5 flex min-h-11 items-center justify-center rounded-lg border border-[#30384e] text-sm text-[#c8a96e] transition hover:border-[#c8a96e]">
            View profile
          </Link>
        </aside>
      </section>
    </main>
  );
}
