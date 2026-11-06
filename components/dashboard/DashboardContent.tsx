import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/dashboard/DashboardNav";

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
    href: "/admin/queue",
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
      followersCount: true,
      likesReceived: true,
      readsCount: true,
    },
  });
  if (!user) redirect("/auth?mode=login");
  if (!user.profileComplete) redirect("/onboarding");

  const role = user.role;
  const copy = dashboardCopy[role];
  const displayName = user.displayName;

  return (
    <>
      <DashboardNav role={role} />

      <section className="mx-auto max-w-6xl px-5 pb-12 pt-10 sm:px-8 sm:pt-16 lg:px-10">
        <div className="rounded-2xl border border-[#30384e] bg-[#171b26] p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">{copy.eyebrow}</p>
            <span className="rounded-full border border-[#c8a96e]/30 bg-[#c8a96e]/[.07] px-3 py-2 text-xs font-semibold text-[#c8a96e]">{role}</span>
          </div>
          <h1 className="mt-8 max-w-2xl font-serif text-4xl tracking-tight text-[#e8ecf4] sm:text-5xl">
            Hi, {displayName}.
            <br />
            <span className="text-[#c8a96e]">{copy.title}</span>
          </h1>
          <p className="mt-5 max-w-xl font-sinhala text-base leading-8 text-[#9ba5c0]">{copy.sinhala}</p>
          <Link href={copy.href} className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-[#c8a96e] px-6 font-semibold text-[#0f1117] transition hover:bg-[#d9ba7d]">
            {copy.action} <span className="ml-2 text-lg">→</span>
          </Link>
          <Link href="/settings/profile" className="ml-3 inline-flex min-h-12 items-center rounded-lg border border-[#30384e] px-5 text-sm text-[#c8a96e] transition hover:border-[#c8a96e]/60">
            Edit public name
          </Link>
          {role === "WRITER" && (
            <Link href={`/writer/${user.username}`} className="ml-3 inline-flex min-h-12 items-center rounded-lg border border-[#30384e] px-5 text-sm text-[#c8a96e] transition hover:border-[#c8a96e]/60">
              View public profile
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(role === "WRITER"
            ? [
                ["01", "Followers", String(user.followersCount)],
                ["02", "Likes received", String(user.likesReceived)],
                ["03", "Reads", String(user.readsCount)],
              ]
            : [
                ["01", "Stories saved", "Your collection"],
                ["02", "Chapters read", "Your activity"],
                ["03", "Coming soon", "More for you"],
              ]).map(([number, title, label]) => (
            <div key={number} className="rounded-xl border border-[#252d40] bg-[#12151e] p-5">
              <span className="font-mono text-xs text-[#c8a96e]">{number}</span>
              <p className="mt-8 text-sm font-semibold text-[#e8ecf4]">{title}</p>
              <p className="mt-2 text-xs text-[#6f7890]">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
