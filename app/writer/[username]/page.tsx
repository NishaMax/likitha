import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import PublicNav from "@/components/navigation/PublicNav";

type WriterPageProps = {
  params: Promise<{ username: string }>;
};

const tierLabels = {
  BRONZE: "Bronze writer",
  SILVER: "Silver writer",
  GOLD: "Gold writer",
  DIAMOND: "Diamond writer",
  FEATURED: "Featured writer",
} as const;

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
            <p className="mt-2 text-sm text-[#c8a96e]">{tierLabels[writer.tier]}</p>
            {writer.bio && <p className="mt-4 max-w-xl text-sm leading-7 text-[#9ba5c0]">{writer.bio}</p>}
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
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Published stories</p>
          <h2 className="mt-4 font-serif text-2xl text-[#e8ecf4]">Stories are on the way.</h2>
          <p className="mt-3 max-w-lg text-sm leading-7 text-[#9ba5c0]">This writer profile is ready. Published stories will appear here when the story publishing phase is complete.</p>
          <Link href="/browse" className="mt-6 inline-flex min-h-11 items-center rounded-lg border border-[#30384e] px-4 text-sm text-[#c8a96e] hover:border-[#c8a96e]">Browse stories →</Link>
        </div>
      </section>
    </main>
  );
}
