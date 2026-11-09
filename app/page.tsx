import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import Brand from "@/components/navigation/Brand";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getArtworkTemplateClass } from "@/lib/artwork";

/** Logged-in users are sent straight to their dashboard — they never see the landing page. */
export default function Home() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  await connection();

  const session = await auth();
  if (session?.user?.email) redirect("/dashboard");

  // Fetch up to 3 approved stories to show as previews on the landing page
  const featuredWorks = await prisma.work.findMany({
    where: { status: "APPROVED" },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      genre: true,
      coverImageUrl: true,
      coverColor: true,
      coverTemplate: true,
      author: { select: { displayName: true } },
      _count: { select: { chapters: true } },
    },
  });

  return (
    <main className="site-home min-h-screen overflow-hidden">
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Brand />
        <nav className="flex items-center gap-2 text-sm" aria-label="Primary navigation">
          <Link href="/browse" className="hidden min-h-11 items-center rounded-full px-4 text-[#B9BBC8] transition hover:text-[#F6F0E6] sm:flex">
            Discover
          </Link>
          <Link href="/auth?mode=login" className="flex min-h-11 items-center rounded-full px-4 text-[#B9BBC8] transition hover:text-[#F6F0E6]">
            Log in
          </Link>
          <Link href="/auth?mode=register" className="flex min-h-11 items-center rounded-full border border-[#E4BD70]/40 px-4 text-[#E4BD70] transition hover:bg-[#E4BD70]/10">
            Sign up
          </Link>
        </nav>
      </header>

      <section className="home-hero relative mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16 lg:px-10 lg:pb-28 lg:pt-24">
        <div className="relative z-10">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c8a96e]/25 bg-[#c8a96e]/[.07] px-3 py-2 text-xs font-medium tracking-wide text-[#c8a96e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c8a96e]" />
            SRI LANKA&apos;S STORY SPACE
          </p>
          <h1 className="max-w-xl font-sinhala text-4xl font-bold leading-[1.35] tracking-tight text-[#e8ecf4] sm:text-5xl lg:text-6xl">
            ඔබේ කතාවට
            <br />
            <span className="text-[#c8a96e]">තැනක්.</span>
          </h1>
          <p className="mt-6 max-w-lg font-sinhala text-base leading-8 text-[#9ba5c0] sm:text-lg">
            සිංහල කතා කියවන්න, ලියන්න, බෙදාගන්න. ශ්‍රී ලංකාවේ නව පරපුරේ ලේඛකයන්ගේ හඬ එකම තැනක.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/browse" className="flex min-h-12 items-center justify-center rounded-lg bg-[#c8a96e] px-6 font-semibold text-[#0f1117] transition hover:bg-[#d9ba7d]">
              Explore stories <span className="ml-2 text-lg">→</span>
            </Link>
            <a href="#discover" className="flex min-h-12 items-center justify-center rounded-lg border border-[#30384e] px-6 font-medium text-[#e8ecf4] transition hover:border-[#c8a96e]/60">
              Share your story
            </a>
          </div>
          <div className="mt-9 flex items-center gap-5 text-xs text-[#6f7890]">
            <span className="flex items-center gap-2"><span className="text-[#c8a96e]">✦</span> Free to read</span>
            <span className="h-1 w-1 rounded-full bg-[#4b5368]" />
            <span>Made for Sinhala</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#c8a96e]/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-20 h-56 w-56 rounded-full bg-[#6b4c32]/20 blur-3xl" />
          <div className="relative rounded-2xl border border-[#30384e] bg-[#171b26] p-4 shadow-2xl shadow-black/30 sm:p-5">
            <div className="flex items-center justify-between border-b border-[#30384e] pb-4">
              <span className="text-xs font-medium uppercase tracking-[.18em] text-[#9ba5c0]">The library is opening</span>
              <span className="rounded-full bg-[#c8a96e]/15 px-3 py-1 text-[10px] font-semibold text-[#c8a96e]">READY</span>
            </div>
            <div className="mt-5 flex min-h-64 items-end rounded-xl bg-gradient-to-br from-[#39285D] via-[#302b39] to-[#171b26] p-5 sm:min-h-72">
              <div>
                <p className="mb-3 text-xs uppercase tracking-[.16em] text-[#c8a96e]">Your next story</p>
                <h2 className="font-sinhala text-2xl font-bold leading-relaxed text-[#f4ead8]">ඔබේ කතාව මෙතැනින් ආරම්භ වේ.</h2>
                <p className="mt-2 text-sm text-[#b8a99a]">Be the first writer to publish on Likitha.</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 text-xs text-[#9ba5c0]">
              <span>Stories · Poetry · Songs</span>
              <Link href="/auth?mode=register" className="text-[#c8a96e]">Start writing →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured stories section — shows up to 3 real approved stories */}
      <section id="discover" className="border-t border-[#202638] bg-[#12151e]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Begin here</p>
              <h2 className="mt-3 font-serif text-3xl text-[#e8ecf4] sm:text-4xl">Stories worth staying for.</h2>
            </div>
            <Link href="/browse" className="hidden min-h-11 items-center text-sm text-[#9ba5c0] hover:text-[#c8a96e] sm:flex">View all <span className="ml-2">→</span></Link>
          </div>

          {featuredWorks.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredWorks.map((work) => {
                const href = work.type === "STORY" ? `/story/${work.id}` : `/work/${work.id}`;
                return (
                  <Link
                    key={work.id}
                    href={href}
                    className="group rounded-2xl border border-[#252d40] bg-[#171b26] p-3 transition hover:-translate-y-1 hover:border-[#c8a96e]/50"
                  >
                    <div
                      className={`relative flex h-48 items-end overflow-hidden rounded-xl bg-gradient-to-br ${getArtworkTemplateClass(work.coverTemplate)} p-4`}
                      style={{ backgroundColor: work.coverColor ?? undefined }}
                    >
                      {work.coverImageUrl && (
                        <Image
                          src={work.coverImageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="relative z-10">
                        <span className="rounded-full bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[.15em] text-[#e9d8b7]">
                          {work.type === "STORY" ? "Story" : work.type === "POETRY" ? "Poetry" : "Song"}
                        </span>
                        <h3 className="mt-3 font-sinhala text-xl font-bold leading-relaxed text-[#f4ead8]">{work.title}</h3>
                      </div>
                    </div>
                    <div className="px-1 pb-1 pt-4">
                      <p className="text-sm text-[#9ba5c0]">by {work.author.displayName}</p>
                      <p className="mt-2 line-clamp-2 font-sinhala text-sm leading-7 text-[#6f7890]">{work.description}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-[#252d40] pt-3 text-xs text-[#6f7890]">
                        <span>
                          {work.type === "STORY"
                            ? work._count.chapters === 1
                              ? "1 chapter"
                              : `${work._count.chapters} chapters`
                            : work.type === "POETRY"
                            ? "Poem"
                            : "Lyrics"}
                        </span>
                        <span className="text-[#c8a96e] group-hover:underline">Read →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Placeholder cards when no stories are published yet */
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["01", "The stories everyone is reading", "Trending now"],
                  ["02", "Fresh voices, new worlds", "New arrivals"],
                  ["03", "Find your next favourite", "Browse genres"],
                ] as const
              ).map(([number, title, label]) => (
                <Link
                  key={number}
                  href="/browse"
                  className="group rounded-xl border border-[#252d40] bg-[#171b26] p-5 transition hover:-translate-y-1 hover:border-[#c8a96e]/40"
                >
                  <span className="font-mono text-xs text-[#c8a96e]">{number}</span>
                  <h3 className="mt-10 font-sinhala text-lg font-bold leading-8 text-[#e8ecf4]">{title}</h3>
                  <p className="mt-2 text-sm text-[#6f7890]">
                    {label} <span className="ml-1 transition group-hover:ml-2 group-hover:text-[#c8a96e]">→</span>
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div id="write" />
    </main>
  );
}
