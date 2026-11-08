import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { WorkActionsBar, DeleteChapterButton } from "@/components/publishing/WorkManagementControls";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default function WriterWorkPage({ params }: Props) {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <WriterWorkContent params={params} />
    </Suspense>
  );
}

async function WriterWorkContent({ params }: Props) {
  const session = await auth();
  const { id } = await params;
  if (!session?.user?.email) redirect("/auth?mode=login");

  const writer = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true, role: true },
  });
  if (!writer || writer.role !== "WRITER") redirect("/dashboard");

  const work = await prisma.work.findFirst({
    where: { id, authorId: writer.id },
    include: {
      chapters: {
        orderBy: { chapterNo: "asc" },
        select: {
          id: true,
          chapterNo: true,
          title: true,
          status: true,
          content: true,
          reviewNote: true,
        },
      },
    },
  });

  if (!work) notFound();

  const isSingleChapterStory =
    work.type === "STORY" && (Boolean(work.content) || work.chapters.length <= 1);
  const singleChapter = work.chapters.length > 0 ? work.chapters[0] : null;

  return (
    <main className="min-h-screen">
      <DashboardNav role="WRITER" />
      <section className="mx-auto max-w-4xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/dashboard/works" className="inline-flex items-center text-sm text-[#9ba5c0] hover:text-[#e8ecf4]">
            ← All works
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            {work.status === "APPROVED" && (
              <Link
                href={work.type === "STORY" ? `/story/${work.id}` : `/work/${work.id}`}
                target="_blank"
                className="inline-flex min-h-10 items-center rounded-lg border border-[#30384e] px-4 text-xs font-semibold text-[#c8a96e] hover:border-[#c8a96e]"
              >
                View live ↗
              </Link>
            )}
            <Link
              href={`/dashboard/works/${work.id}/edit`}
              className="inline-flex min-h-10 items-center rounded-lg bg-[#c8a96e] px-4 text-xs font-semibold text-[#0f1117] transition hover:bg-[#d9ba7d]"
            >
              {work.status === "DRAFT" ? "Edit draft" : "Edit work"}
            </Link>
            <WorkActionsBar workId={work.id} status={work.status} workTitle={work.title} />
          </div>
        </div>

        {/* Status banners */}
        {work.status === "DRAFT" && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#c8a96e]/30 bg-[#c8a96e]/[.06] p-4 text-sm text-[#e8ecf4]">
            <div>
              <p className="font-semibold text-[#c8a96e]">Draft mode</p>
              <p className="mt-0.5 text-xs text-[#9ba5c0]">
                This work is private and not yet submitted for review. Edit and refine it until you are ready.
              </p>
            </div>
            <Link
              href={`/dashboard/works/${work.id}/edit`}
              className="inline-flex min-h-9 items-center rounded-lg bg-[#c8a96e] px-3.5 text-xs font-semibold text-[#0f1117]"
            >
              Continue editing →
            </Link>
          </div>
        )}

        {work.status === "REJECTED" && (
          <div className="mt-6 rounded-xl border border-[#f87171]/40 bg-[#f87171]/10 p-4 text-sm text-[#fca5a5]">
            <p className="font-semibold text-[#f87171]">Submission rejected</p>
            {work.reviewNote ? (
              <p className="mt-1 leading-6">{work.reviewNote}</p>
            ) : (
              <p className="mt-1 text-xs">Please review the content and resubmit when ready.</p>
            )}
            <Link
              href={`/dashboard/works/${work.id}/edit`}
              className="mt-3 inline-flex min-h-9 items-center rounded-lg bg-[#f87171] px-3.5 text-xs font-semibold text-[#180a0a]"
            >
              Edit & resubmit →
            </Link>
          </div>
        )}

        {work.status === "PENDING" && (
          <div className="mt-6 rounded-xl border border-[#fbbf24]/30 bg-[#fbbf24]/[.06] p-4 text-sm text-[#fbbf24]">
            <p className="font-semibold">Under review</p>
            <p className="mt-0.5 text-xs text-[#d8c59d]">
              Our administrator is reviewing your submission. You will receive a notification once reviewed.
            </p>
          </div>
        )}

        {/* Work Header */}
        <div className="mt-8 rounded-2xl border border-[#252d40] bg-[#171b26] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[.15em] text-[#c8a96e]">
                <span>{work.type}</span>
                <span>•</span>
                <span>{work.genre}</span>
                {work.type === "STORY" && (
                  <>
                    <span>•</span>
                    <span className="text-[#9ba5c0]">
                      {isSingleChapterStory ? "Single-chapter story" : "Series"}
                    </span>
                  </>
                )}
              </div>
              <h1 className="mt-3 font-sinhala text-3xl font-bold text-[#e8ecf4] sm:text-4xl">{work.title}</h1>
              <p className="mt-4 max-w-2xl font-sinhala text-sm leading-7 text-[#c4cada]">{work.description}</p>
            </div>
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wider ${
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
        </div>

        {/* Content preview for Single Chapter Story OR Poetry / Song */}
        {(work.type !== "STORY" || (isSingleChapterStory && (work.content || singleChapter?.content))) && (
          <div className="mt-8 rounded-2xl border border-[#252d40] bg-[#171b26] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">
                  {work.type === "STORY" ? "Story content" : work.type === "POETRY" ? "Poem" : "Lyrics"}
                </p>
                <h2 className="mt-1 font-serif text-xl text-[#e8ecf4]">
                  {work.type === "STORY" ? "Single Chapter" : "Written Content"}
                </h2>
              </div>
              <Link
                href={`/dashboard/works/${work.id}/edit`}
                className="inline-flex min-h-9 items-center rounded-lg border border-[#30384e] px-3.5 text-xs text-[#c8a96e] hover:border-[#c8a96e]"
              >
                Edit content
              </Link>
            </div>
            <div className="mt-5 max-h-96 overflow-y-auto whitespace-pre-line rounded-xl bg-[#12151e] p-5 font-sinhala text-base leading-8 text-[#d2d7e2]">
              {work.content || singleChapter?.content || "No content written yet."}
            </div>
          </div>
        )}

        {/* Chapters section for STORY */}
        {work.type === "STORY" && (
          <div className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-[#e8ecf4]">Chapters</h2>
                <p className="text-xs text-[#6f7890]">
                  {work.chapters.length} {work.chapters.length === 1 ? "chapter" : "chapters"} total
                </p>
              </div>
              <Link
                href={`/dashboard/works/${work.id}/chapter/new`}
                className="min-h-11 rounded-lg bg-[#c8a96e] px-4 py-2.5 text-sm font-semibold text-[#0f1117] transition hover:bg-[#d9ba7d]"
              >
                + Add chapter
              </Link>
            </div>

            {work.chapters.length ? (
              <div className="mt-5 divide-y divide-[#252d40] rounded-2xl border border-[#252d40] bg-[#171b26] px-5">
                {work.chapters.map((chapter) => (
                  <div key={chapter.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1e2335] font-mono text-xs text-[#c8a96e]">
                          {chapter.chapterNo}
                        </span>
                        <span className="font-sinhala font-medium text-sm text-[#e8ecf4]">
                          Chapter {chapter.chapterNo}: {chapter.title}
                        </span>
                      </div>
                      {chapter.reviewNote && chapter.status === "REJECTED" && (
                        <p className="mt-2 text-xs text-[#fca5a5]">Feedback: {chapter.reviewNote}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider ${
                          chapter.status === "APPROVED"
                            ? "border-[#86efac]/40 bg-[#86efac]/10 text-[#86efac]"
                            : chapter.status === "PENDING"
                            ? "border-[#fbbf24]/40 bg-[#fbbf24]/10 text-[#fbbf24]"
                            : chapter.status === "REJECTED"
                            ? "border-[#f87171]/40 bg-[#f87171]/10 text-[#f87171]"
                            : "border-[#30384e] bg-[#12151e] text-[#9ba5c0]"
                        }`}
                      >
                        {chapter.status}
                      </span>
                      <Link
                        href={`/dashboard/works/${work.id}/chapter/${chapter.id}/edit`}
                        className="inline-flex min-h-8 items-center rounded-lg border border-[#30384e] px-3 text-xs text-[#c8a96e] hover:border-[#c8a96e]"
                      >
                        Edit
                      </Link>
                      <DeleteChapterButton workId={work.id} chapterId={chapter.id} chapterNo={chapter.chapterNo} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-[#30384e] p-8 text-center">
                <p className="text-sm text-[#9ba5c0]">No chapters added yet.</p>
                <Link
                  href={`/dashboard/works/${work.id}/chapter/new`}
                  className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-[#c8a96e] px-4 text-xs font-semibold text-[#0f1117]"
                >
                  Add Chapter 1
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
