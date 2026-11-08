import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { prisma } from "@/lib/prisma";

export default function WriterWorksPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <WriterWorksContent />
    </Suspense>
  );
}

async function WriterWorksContent() {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth?mode=login");
  const writer = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true, role: true },
  });
  if (!writer || writer.role !== "WRITER") redirect("/dashboard");

  const works = await prisma.work.findMany({
    where: { authorId: writer.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      genre: true,
      status: true,
      content: true,
      chapters: {
        select: { id: true, chapterNo: true, title: true, status: true },
        orderBy: { chapterNo: "asc" },
      },
    },
  });

  return (
    <main className="min-h-screen">
      <DashboardNav role="WRITER" />
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Writer studio</p>
            <h1 className="mt-4 font-serif text-4xl text-[#e8ecf4]">Your works</h1>
            <p className="mt-3 text-sm text-[#9ba5c0]">Create, edit drafts, and submit your stories, poetry, and songs.</p>
          </div>
          <Link
            href="/dashboard/story/new"
            className="inline-flex min-h-12 items-center rounded-lg bg-[#c8a96e] px-5 font-semibold text-[#0f1117] transition hover:bg-[#d9ba7d]"
          >
            Create new work →
          </Link>
        </div>

        {works.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {works.map((work) => {
              const isSingleChapter =
                work.type === "STORY" && (Boolean(work.content) || work.chapters.length <= 1);
              return (
                <div
                  key={work.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#252d40] bg-[#171b26] p-6 transition hover:border-[#c8a96e]/50"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[.15em] text-[#c8a96e]">
                        {work.type} • {work.genre}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider ${
                          work.status === "APPROVED"
                            ? "border-[#86efac]/40 bg-[#86efac]/10 text-[#86efac]"
                            : work.status === "PENDING"
                            ? "border-[#fbbf24]/40 bg-[#fbbf24]/10 text-[#fbbf24]"
                            : work.status === "REJECTED"
                            ? "border-[#f87171]/40 bg-[#f87171]/10 text-[#f87171]"
                            : "border-[#30384e] bg-[#12151e] text-[#9ba5c0]"
                        }`}
                      >
                        {work.status}
                      </span>
                    </div>

                    <Link href={`/dashboard/works/${work.id}`}>
                      <h2 className="mt-4 font-sinhala text-xl font-bold text-[#e8ecf4] hover:text-[#c8a96e]">
                        {work.title}
                      </h2>
                    </Link>

                    <p className="mt-2 text-xs text-[#6f7890]">
                      {work.type === "STORY"
                        ? isSingleChapter
                          ? "Single-chapter story"
                          : `${work.chapters.length} chapters`
                        : "Single work"}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#252d40] pt-4">
                    <Link
                      href={`/dashboard/works/${work.id}`}
                      className="text-xs text-[#9ba5c0] hover:text-[#e8ecf4]"
                    >
                      View details →
                    </Link>
                    <Link
                      href={`/dashboard/works/${work.id}/edit`}
                      className={`inline-flex min-h-8 items-center rounded-lg px-3 text-xs font-semibold transition ${
                        work.status === "DRAFT"
                          ? "bg-[#c8a96e] text-[#0f1117] hover:bg-[#d9ba7d]"
                          : "border border-[#30384e] text-[#c8a96e] hover:border-[#c8a96e]"
                      }`}
                    >
                      {work.status === "DRAFT" ? "Edit draft" : "Edit work"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[#30384e] p-10 text-center">
            <p className="text-[#9ba5c0]">You have not created a work yet.</p>
            <Link
              href="/dashboard/story/new"
              className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[#c8a96e] px-4 text-sm font-semibold text-[#0f1117]"
            >
              Create your first work
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
