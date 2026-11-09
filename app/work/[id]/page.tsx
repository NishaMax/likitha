import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import PublicNav from "@/components/navigation/PublicNav";
import ReadingProgressButton from "@/components/reading/ReadingProgressButton";
import { prisma } from "@/lib/prisma";
import EngagementControls from "@/components/engagement/EngagementControls";
import CommentsSection from "@/components/engagement/CommentsSection";
import ViewTracker from "@/components/engagement/ViewTracker";
import { connection } from "next/server";
import { getArtworkTemplateClass } from "@/lib/artwork";

type WorkPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { id } = await params;
  const work = await prisma.work.findFirst({
    where: { id, status: "APPROVED", type: { in: ["POETRY", "SONG"] } },
    select: {
      type: true,
      title: true,
      description: true,
      genre: true,
      coverImageUrl: true,
      author: { select: { displayName: true } },
    },
  });

  if (!work) {
    return {
      title: "Work Not Found | Likitha",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://likitha.lk";
  const label = work.type === "POETRY" ? "Poetry" : "Song Lyrics";
  const title = `${work.title} (${label}) — ${work.author.displayName}`;
  const description = work.description.slice(0, 160);

  return {
    title,
    description,
    keywords: [work.title, work.author.displayName, work.genre, label, "Likitha"],
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteUrl}/work/${id}`,
      siteName: "Likitha",
      ...(work.coverImageUrl ? { images: [{ url: work.coverImageUrl, alt: work.title }] } : {}),
    },
    twitter: {
      card: work.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(work.coverImageUrl ? { images: [work.coverImageUrl] } : {}),
    },
    alternates: {
      canonical: `/work/${id}`,
    },
  };
}

export default function WorkPage({ params }: WorkPageProps) {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <WorkPageContent params={params} />
    </Suspense>
  );
}

async function WorkPageContent({ params }: WorkPageProps) {
  await connection();
  const { id } = await params;
  const databaseWork = await prisma.work.findFirst({
    where: { id, status: "APPROVED", type: { in: ["POETRY", "SONG"] } },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      genre: true,
      content: true,
      coverImageUrl: true,
      coverColor: true,
      coverTemplate: true,
      author: { select: { displayName: true } },
    },
  });
  const work = databaseWork ? {
    ...databaseWork,
    type: databaseWork.type === "POETRY" ? "Poetry" as const : "Songs" as const,
    author: databaseWork.author.displayName,
    readers: "New",
    color: databaseWork.type === "POETRY" ? "from-[#4c4a70] via-[#34344f] to-[#1b202c]" : "from-[#6d4b68] via-[#403149] to-[#1d202d]",
  } : null;

  if (!work) notFound();

  const label = work.type === "Poetry" ? "Poetry" : "Song lyrics";

  // JSON-LD structured data for Google SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: work.title,
    headline: work.title,
    description: work.description,
    author: {
      "@type": "Person",
      name: work.author,
    },
    genre: work.genre,
    inLanguage: "si",
    image: work.coverImageUrl ?? undefined,
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker workId={work.id} />
      <PublicNav />
      <section className="relative overflow-hidden border-y border-[#202638] bg-[#12151e]">
        <div className={`absolute inset-0 bg-gradient-to-br ${work.color} opacity-20`} />
        <div className="relative mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-20">
          <div className={`relative flex min-h-72 items-end overflow-hidden rounded-2xl bg-gradient-to-br ${getArtworkTemplateClass(work.coverTemplate)} p-6 sm:min-h-96 sm:p-10`} style={{ backgroundColor: work.coverColor ?? undefined }}>
            {work.coverImageUrl && <Image src={work.coverImageUrl} alt="" fill className="object-cover" unoptimized priority />}
            <div className="relative z-10">
              <span className="rounded-full bg-black/25 px-3 py-1.5 text-xs uppercase tracking-[.15em] text-[#e9d8b7]">{label}</span>
              <h1 className="mt-5 max-w-2xl font-sinhala text-4xl font-bold leading-relaxed text-[#f4ead8] sm:text-5xl">{work.title}</h1>
              <p className="mt-2 text-sm text-[#d3c3b0]">by {work.author}</p>
            </div>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-wrap gap-4 text-xs text-[#6f7890]">
          <span>{work.genre}</span>
          <span>{work.readers} reads</span>
          <span>Published work</span>
        </div>
        <p className="mt-8 font-sinhala text-lg leading-10 text-[#c4cada]">{work.description}</p>
        <div className="mt-10 rounded-2xl border border-[#252d40] bg-[#171b26] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">{label}</p>
          <p className="mt-5 whitespace-pre-line font-sinhala text-base leading-10 text-[#e8ecf4]">
            {work.content || `මෙම ${work.type === "Poetry" ? "කවිය" : "ගී පදය"} ඉදිරියේදී සම්පූර්ණයෙන් කියවීමට හැකි වේ.`}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <EngagementControls workId={work.id} />
          <ReadingProgressButton workId={work.id} workType={work.type === "Poetry" ? "POETRY" : "SONG"} />
          <Link href="/browse" className="inline-flex min-h-11 items-center rounded-lg border border-[#30384e] px-4 text-sm text-[#c8a96e] hover:border-[#c8a96e]">
            ← Back to discover
          </Link>
        </div>
        <CommentsSection workId={work.id} />
      </article>
    </main>
  );
}
