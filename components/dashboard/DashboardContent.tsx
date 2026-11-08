import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/dashboard/DashboardNav";
import TierBadge from "@/components/profile/TierBadge";

const dashboardCopy = {
  READER: {
    eyebrow: "Your reading space",
    title: "Keep reading.",
    sinhala: "ඔබේ ප්‍රියතම කතා මෙතැනින් දිගටම කියවන්න.",
    action: "Explore stories",
    href: "/browse",
  },
  WRITER: {
    eyebrow: "Your writing space",
    title: "Your next chapter starts here.",
    sinhala: "ඔබේ කතාව ලෝකය සමඟ බෙදාගන්න.",
    action: "Create a story",
    href: "/dashboard/story/new",
  },
  ADMIN: {
    eyebrow: "Platform control",
    title: "Keep Likitha moving.",
    sinhala: "කතා පරීක්ෂා කර, ලේඛකයන්ට සහාය වන්න.",
    action: "Review queue",
    href: "/admin/reviews",
  },
} as const;

export default async function DashboardContent() {
  const session = await auth();

  if (!session?.user) redirect("/auth?mode=login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email?.toLowerCase() },
    select: {
      role: true,
      displayName: true,
      username: true,
      profileComplete: true,
      avatarUrl: true,
      followersCount: true,
      likesReceived: true,
      readsCount: true,
      tier: true,
      tierScore: true,
      readingProgress: {
        orderBy: { lastReadAt: "desc" },
        take: 8,
        select: {
          workId: true,
          workType: true,
          chaptersRead: true,
          totalChapters: true,
          completed: true,
          lastReadAt: true,
        },
      },
    },
  });
  if (!user) redirect("/auth?mode=login");
  if (!user.profileComplete) redirect("/onboarding");
  const progressWorks = await prisma.work.findMany({
    where: { id: { in: user.readingProgress.map((item) => item.workId) }, status: "APPROVED" },
    select: { id: true, type: true, title: true, chapters: { where: { status: "APPROVED" }, select: { id: true } } },
  });
  const progressWorkMap = new Map(progressWorks.map((work) => [work.id, work]));

  const role = user.role;
  const copy = dashboardCopy[role];
  const displayName = user.displayName;
  const readerProgress = user.readingProgress;
  const storiesCompleted = readerProgress.filter((item) => item.workType === "STORY" && item.completed).length;
  const poetryRead = readerProgress.filter((item) => item.workType === "POETRY" && item.completed).length;
  const songsRead = readerProgress.filter((item) => item.workType === "SONG" && item.completed).length;
  const chaptersRead = readerProgress.reduce((total, item) => total + item.chaptersRead, 0);

  return (
    <>
      <DashboardNav role={role} />

      <section className="mx-auto max-w-6xl px-5 pb-12 pt-10 sm:px-8 sm:pt-16 lg:px-10">
        <div className="rounded-2xl border border-[#30384e] bg-[#171b26] p-6 sm:p-10">
          <div className="flex flex-col-reverse gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">{copy.eyebrow}</p>
                <span className="rounded-full border border-[#c8a96e]/30 bg-[#c8a96e]/[.07] px-3 py-2 text-xs font-semibold text-[#c8a96e]">{role}</span>
              </div>
              <h1 className="mt-8 max-w-2xl font-serif text-4xl tracking-tight text-[#e8ecf4] sm:text-5xl">
                Hi, {displayName}.
                <br />
                <span className="text-[#c8a96e]">{copy.title}</span>
              </h1>
              <p className="mt-5 max-w-xl font-sinhala text-base leading-8 text-[#9ba5c0]">{copy.sinhala}</p>
              <div className="flex flex-wrap gap-3">
                <Link href={copy.href} className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-[#c8a96e] px-6 font-semibold text-[#0f1117] transition hover:bg-[#d9ba7d]">
                  {copy.action} <span className="ml-2 text-lg">→</span>
                </Link>
                <Link href="/settings/profile" className="mt-8 inline-flex min-h-12 items-center rounded-lg border border-[#30384e] px-5 text-sm text-[#c8a96e] transition hover:border-[#c8a96e]/60">
                  Edit public name
                </Link>
                {role === "WRITER" && (
                  <Link href={`/writer/${user.username}`} className="mt-8 inline-flex min-h-12 items-center rounded-lg border border-[#30384e] px-5 text-sm text-[#c8a96e] transition hover:border-[#c8a96e]/60">
                    View public profile
                  </Link>
                )}
              </div>
            </div>
            <div className="flex shrink-0 justify-center sm:justify-end">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-[#c8a96e]/50 bg-[#12151e] text-5xl font-serif text-[#c8a96e] shadow-[0_0_0_8px_rgba(200,169,110,0.07)] sm:h-36 sm:w-36 sm:text-6xl">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={`${displayName} avatar`} width={144} height={144} className="h-full w-full object-cover" unoptimized />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(role === "WRITER"
            ? [
                ["01", "Followers", String(user.followersCount)],
                ["02", "Likes received", String(user.likesReceived)],
                ["03", "Reads", String(user.readsCount)],
              ]
            : [
                ["01", "Stories completed", String(storiesCompleted)],
                ["02", "Poetry read", String(poetryRead)],
                ["03", "Songs read", String(songsRead)],
              ]).map(([number, title, label]) => (
            <div key={number} className="rounded-xl border border-[#252d40] bg-[#12151e] p-5">
              <span className="font-mono text-xs text-[#c8a96e]">{number}</span>
              <p className="mt-8 text-sm font-semibold text-[#e8ecf4]">{title}</p>
              <p className="mt-2 text-xs text-[#6f7890]">{label}</p>
            </div>
          ))}
        </div>
        {role === "WRITER" && (
          <div className="mt-6 rounded-2xl border border-[#252d40] bg-[#12151e] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Writer tier</p>
                <div className="mt-3 flex items-center gap-3">
                  <TierBadge tier={user.tier} />
                  <span className="text-sm text-[#9ba5c0]">{user.tierScore} points</span>
                </div>
              </div>
              <p className="max-w-xs text-right text-xs leading-6 text-[#6f7890]">Earn points through approved chapters and reader engagement.</p>
            </div>
          </div>
        )}
        {role === "READER" && (
          <div className="mt-8 rounded-2xl border border-[#252d40] bg-[#12151e] p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Your reading profile</p>
                <h2 className="mt-3 font-serif text-2xl text-[#e8ecf4]">Recently read</h2>
              </div>
              <p className="text-sm text-[#6f7890]">{chaptersRead} chapters read</p>
            </div>
            {readerProgress.length > 0 ? (
              <div className="mt-5 divide-y divide-[#252d40]">
                {readerProgress.map((item) => {
                  const work = progressWorkMap.get(item.workId);
                  if (!work) return null;
                  const href = work.type === "STORY" ? `/story/${work.id}` : `/work/${work.id}`;
                  const progressLabel = work.type === "STORY"
                    ? `${item.chaptersRead} of ${item.totalChapters ?? work.chapters.length} chapters`
                    : item.completed ? "Marked as read" : "In progress";
                  return (
                    <Link key={item.workId} href={href} className="flex min-h-16 items-center gap-4 py-4 hover:text-[#c8a96e]">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${item.completed ? "bg-[#86efac]/15 text-[#bbf7d0]" : "bg-[#1e2335] text-[#c8a96e]"}`}>
                        {item.completed ? "✓" : "•"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-sinhala text-sm text-[#e8ecf4]">{work.title}</span>
                        <span className="mt-1 block text-xs text-[#6f7890]">{progressLabel}</span>
                      </span>
                      <span className="text-[#6f7890]">→</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-7 text-[#6f7890]">Your reading history will appear here when you mark a story, poem, or song as read.</p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
