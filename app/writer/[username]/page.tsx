import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import PublicNav from "@/components/navigation/PublicNav";
import FollowButton from "@/components/engagement/FollowButton";
import TierBadge from "@/components/profile/TierBadge";

type WriterPageProps = {
  params: Promise<{ username: string }>;
};

export default function WriterPage({ params }: WriterPageProps) {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <WriterProfileContent params={params} />
    </Suspense>
  );
}

async function WriterProfileContent({ params }: WriterPageProps) {
  const { username } = await params;
  const writer = await prisma.user.findFirst({
    where: { username, role: "WRITER", isBanned: false },
    select: {
      displayName: true,
      bio: true,
      avatarUrl: true,
      tier: true,
      followersCount: true,
      likesReceived: true,
      readsCount: true,
      tierScore: true,
      works: {
        where: { status: "APPROVED" },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          genre: true,
          _count: { select: { chapters: true } },
        },
      },
    },
  });

  if (!writer) notFound();

  return (
    <main className="min-h-screen">
      <PublicNav />
      <section className="mx-auto max-w-4xl px-5 pb-20 pt-12 sm:px-8 sm:pt-20">
        <div className="flex flex-col items-start gap-6 border-b border-[#252d40] pb-10 sm:flex-row sm:items-center">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#c8a96e]/40 bg-[#171b26] text-4xl font-serif text-[#c8a96e]">
            {writer.avatarUrl ? <Image src={writer.avatarUrl} alt="" width={112} height={112} className="h-full w-full object-cover" unoptimized /> : writer.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Writer profile</p>
            <h1 className="mt-3 font-serif text-4xl text-[#e8ecf4]">{writer.displayName}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <TierBadge tier={writer.tier} />
              <span className="text-xs text-[#6f7890]">{writer.tierScore} points</span>
            </div>
            {writer.bio && <p className="mt-4 max-w-xl text-sm leading-7 text-[#9ba5c0]">{writer.bio}</p>}
            <div className="mt-5"><FollowButton username={username} /></div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            ["Followers", writer.followersCount],
            ["Likes", writer.likesReceived],
            ["Reads", writer.readsCount],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[#252d40] bg-[#12151e] p-4 text-center">
              <p className="font-serif text-2xl text-[#e8ecf4]">{value}</p>
              <p className="mt-1 text-xs text-[#6f7890]">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[#252d40] bg-[#171b26] p-6">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Published works</p>
          <h2 className="mt-4 font-serif text-2xl text-[#e8ecf4]">Words from this writer.</h2>
          {writer.works.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {writer.works.map((work) => (
                <Link key={work.id} href={work.type === "STORY" ? `/story/${work.id}` : `/work/${work.id}`} className="rounded-xl border border-[#30384e] bg-[#12151e] p-4 hover:border-[#c8a96e]/60">
                  <span className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#c8a96e]">{work.type}</span>
                  <h3 className="mt-3 font-sinhala text-lg text-[#e8ecf4]">{work.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6f7890]">{work.description}</p>
                  <p className="mt-3 text-xs text-[#9ba5c0]">{work.genre}{work.type === "STORY" ? ` · ${work._count.chapters} chapters` : ""}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-[#9ba5c0]">Published works will appear here when this writer shares them.</p>
          )}
          <Link href="/browse" className="mt-6 inline-flex min-h-11 items-center rounded-lg border border-[#30384e] px-4 text-sm text-[#c8a96e] hover:border-[#c8a96e]">Browse all works →</Link>
        </div>
      </section>
    </main>
  );
}
