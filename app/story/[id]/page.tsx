import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import PublicNav from "@/components/navigation/PublicNav";
import EngagementControls from "@/components/engagement/EngagementControls";
import CommentsSection from "@/components/engagement/CommentsSection";
import ViewTracker from "@/components/engagement/ViewTracker";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import { getArtworkTemplateClass } from "@/lib/artwork";

type StoryPageProps = {
  params: Promise<{ id: string }>;
};

type StoryView = {
  id: string;
  title: string;
  description: string;
  genre: string;
  author: string;
  authorUsername: string;
  isSingleStory: boolean;
  chapters: number;
  color: string;
  chapterPreviews: { number: number; title: string; date: string }[];
  coverImageUrl: string | null;
  coverColor: string | null;
  coverTemplate: string;
};

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const story = await prisma.work.findFirst({
    where: { id, type: "STORY", status: "APPROVED" },
    select: {
      title: true,
      description: true,
      genre: true,
      coverImageUrl: true,
      author: { select: { displayName: true } },
    },
  });

  if (!story) {
    return {
      title: "Story Not Found | Likitha",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://likitha.lk";
  const title = `${story.title} — ${story.author.displayName}`;
  const description = story.description.slice(0, 160);

  return {
    title,
    description,
    keywords: [story.title, story.author.displayName, story.genre, "Sinhala story", "Likitha"],
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteUrl}/story/${id}`,
      siteName: "Likitha",
      ...(story.coverImageUrl ? { images: [{ url: story.coverImageUrl, alt: story.title }] } : {}),
    },
    twitter: {
      card: story.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(story.coverImageUrl ? { images: [story.coverImageUrl] } : {}),
    },
    alternates: {
      canonical: `/story/${id}`,
    },
  };
}

export default function StoryPage({ params }: StoryPageProps) {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <StoryPageContent params={params} />
    </Suspense>
  );
}

async function StoryPageContent({ params }: StoryPageProps) {
  await connection();
  const { id } = await params;
  const databaseStory = await prisma.work.findFirst({
    where: { id, type: "STORY", status: "APPROVED" },
    select: {
      id: true,
      title: true,
      description: true,
      genre: true,
      content: true,
      coverImageUrl: true,
      coverColor: true,
      coverTemplate: true,
      author: { select: { displayName: true, username: true } },
      chapters: {
        where: { status: "APPROVED" },
        orderBy: { chapterNo: "asc" },
        select: { chapterNo: true, title: true, publishedAt: true },
      },
    },
  });

  const story: StoryView | null = databaseStory ? {
    id: databaseStory.id,
    title: databaseStory.title,
    description: databaseStory.description,
    genre: databaseStory.genre,
    author: databaseStory.author.displayName,
    authorUsername: databaseStory.author.username,
    isSingleStory: Boolean(databaseStory.content),
    chapters: databaseStory.chapters.length,
    color: "from-[#334c50] via-[#273443] to-[#1b202d]",
    chapterPreviews: databaseStory.chapters.map((chapter) => ({
      number: chapter.chapterNo,
      title: chapter.title,
      date: chapter.publishedAt ? new Date(chapter.publishedAt).toLocaleDateString() : "Published",
    })),
    coverImageUrl: databaseStory.coverImageUrl,
    coverColor: databaseStory.coverColor,
    coverTemplate: databaseStory.coverTemplate,
  } : null;

  if (story === null) notFound();
  const previews = story.chapterPreviews;

  // JSON-LD structured data for Google Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: story.title,
    headline: story.title,
    description: story.description,
    author: {
      "@type": "Person",
      name: story.author,
    },
    genre: story.genre,
    inLanguage: "si",
    image: story.coverImageUrl ?? undefined,
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          <div className={`relative flex h-72 items-end overflow-hidden rounded-2xl bg-gradient-to-br ${getArtworkTemplateClass(story.coverTemplate)} p-6 shadow-2xl shadow-black/30 sm:h-96`} style={{ backgroundColor: story.coverColor ?? undefined }}>
            {story.coverImageUrl && <Image src={story.coverImageUrl} alt="" fill className="object-cover" unoptimized priority />}
            <div className="relative z-10">
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
              <span>
                {story.isSingleStory
                  ? "1 chapter (Single story)"
                  : story.chapters === 1
                  ? "1 chapter (Series)"
                  : `${story.chapters} chapters (Series)`}
              </span>
              <span>New readers</span>
              <span>{story.isSingleStory ? "Complete story" : "Ongoing series"}</span>
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
            {previews.map((chapter) => (
              <Link key={chapter.number} href={`/story/${story.id}/chapter/${chapter.number}`} className="flex min-h-20 items-center gap-4 py-4 transition hover:text-[#c8a96e]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e2335] font-mono text-xs text-[#c8a96e]">{String(chapter.number).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-sinhala text-base text-[#e8ecf4]">{chapter.title}</span>
                  <span className="mt-1 block text-xs text-[#6f7890]">{chapter.date}</span>
                </span>
                <span className="text-[#6f7890]">→</span>
              </Link>
            ))}
            {!story.isSingleStory && (
              <div className="py-4 text-center text-xs text-[#6f7890]">More chapters coming soon</div>
            )}
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
          <Link href={`/writer/${story.authorUsername}`} className="mt-5 inline-block text-xs text-[#c8a96e] hover:underline">
            View full profile →
          </Link>
        </aside>
      </section>
    </main>
  );
}
