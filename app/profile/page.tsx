import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { prisma } from "@/lib/prisma";
import { works } from "@/lib/stories";

export default function ReaderProfilePage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <ReaderProfileContent />
    </Suspense>
  );
}

async function ReaderProfileContent() {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth?mode=login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: {
      role: true,
      displayName: true,
      avatarUrl: true,
      savedWorks: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { workId: true },
      },
      readingProgress: {
        orderBy: { lastReadAt: "desc" },
        take: 20,
        select: {
          workId: true,
          workType: true,
          chaptersRead: true,
          totalChapters: true,
          completed: true,
        },
      },
    },
  });

  if (!user) redirect("/auth?mode=login");
  if (user.role !== "READER") redirect("/dashboard");

  const completed = user.readingProgress.filter((item) => item.completed);
  const storiesCompleted = completed.filter((item) => item.workType === "STORY").length;
  const poetryRead = completed.filter((item) => item.workType === "POETRY").length;
  const songsRead = completed.filter((item) => item.workType === "SONG").length;
  const chaptersRead = user.readingProgress.reduce((total, item) => total + item.chaptersRead, 0);

  return (
    <main className="min-h-screen">
      <DashboardNav role="READER" />
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:px-10">
        <div className="flex flex-col gap-6 rounded-2xl border border-[#30384e] bg-[#171b26] p-6 sm:flex-row sm:items-center sm:p-10">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#c8a96e]/50 bg-[#12151e] text-4xl font-serif text-[#c8a96e]">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={`${user.displayName} avatar`} width={96} height={96} className="h-full w-full object-cover" unoptimized />
            ) : (
              user.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Reader profile</p>
            <h1 className="mt-3 font-serif text-4xl text-[#e8ecf4]">{user.displayName}</h1>
            <p className="mt-2 text-sm text-[#9ba5c0]">Your stories, poems, songs, and reading journey.</p>
          </div>
          <Link href="/settings/profile" className="inline-flex min-h-11 items-center rounded-lg border border-[#30384e] px-4 text-sm text-[#c8a96e] hover:border-[#c8a96e] sm:ml-auto">
            Edit profile
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[
            ["Stories completed", storiesCompleted],
            ["Poetry read", poetryRead],
            ["Songs read", songsRead],
            ["Chapters read", chaptersRead],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[#252d40] bg-[#12151e] p-5">
              <p className="font-serif text-3xl text-[#e8ecf4]">{value}</p>
              <p className="mt-2 text-xs text-[#6f7890]">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-[#252d40] bg-[#12151e] p-6">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Saved works</p>
          <h2 className="mt-3 font-serif text-2xl text-[#e8ecf4]">Keep for later</h2>
          {user.savedWorks.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {user.savedWorks.map((saved) => {
                const work = works.find((candidate) => candidate.id === saved.workId);
                if (!work) return null;
                return <Link key={saved.workId} href={work.type === "Stories" ? `/story/${work.id}` : `/work/${work.id}`} className="rounded-lg border border-[#30384e] bg-[#171b26] p-4 text-sm text-[#e8ecf4] hover:border-[#c8a96e]/60">{work.title}<span className="mt-1 block text-xs text-[#6f7890]">{work.type}</span></Link>;
              })}
            </div>
          ) : <p className="mt-5 text-sm text-[#6f7890]">Save stories, poetry, or songs to find them here.</p>}
        </div>

        <div className="mt-8 rounded-2xl border border-[#252d40] bg-[#12151e] p-6">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Reading history</p>
          <h2 className="mt-3 font-serif text-2xl text-[#e8ecf4]">Your recent reading</h2>
          {user.readingProgress.length > 0 ? (
            <div className="mt-5 divide-y divide-[#252d40]">
              {user.readingProgress.map((item) => {
                const work = works.find((candidate) => candidate.id === item.workId);
                if (!work) return null;
                const href = work.type === "Stories" ? `/story/${work.id}` : `/work/${work.id}`;
                const status = work.type === "Stories"
                  ? `${item.chaptersRead} of ${item.totalChapters ?? work.chapters} chapters`
                  : item.completed ? "Marked as read" : "In progress";
                return (
                  <Link key={item.workId} href={href} className="flex min-h-16 items-center gap-4 py-4 hover:text-[#c8a96e]">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${item.completed ? "bg-[#86efac]/15 text-[#bbf7d0]" : "bg-[#1e2335] text-[#c8a96e]"}`}>
                      {item.completed ? "✓" : "•"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-sinhala text-sm text-[#e8ecf4]">{work.title}</span>
                      <span className="mt-1 block text-xs text-[#6f7890]">{status}</span>
                    </span>
                    <span className="text-[#6f7890]">→</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-[#30384e] p-6 text-center">
              <p className="text-sm text-[#9ba5c0]">Your reading history will appear here.</p>
              <Link href="/browse" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-[#c8a96e] px-4 text-sm font-semibold text-[#0f1117]">Discover something to read</Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
