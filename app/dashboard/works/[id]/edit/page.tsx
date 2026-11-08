import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import WriterWorkForm from "@/components/publishing/WriterWorkForm";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default function EditWorkPage({ params }: Props) {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <EditWorkContent params={params} />
    </Suspense>
  );
}

async function EditWorkContent({ params }: Props) {
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
      chapters: { orderBy: { chapterNo: "asc" } },
    },
  });

  if (!work) notFound();

  // If work has 1 chapter, retrieve its content for editing if work.content is not set
  const firstChapterContent = work.chapters.length > 0 ? work.chapters[0].content : null;
  const initialContent = work.content || firstChapterContent || "";

  const initialWork = {
    id: work.id,
    type: work.type,
    storyFormat: (work.content || work.chapters.length <= 1 ? "SINGLE" : "SERIAL") as "SINGLE" | "SERIAL",
    title: work.title,
    description: work.description,
    genre: work.genre,
    content: initialContent,
    coverImageUrl: work.coverImageUrl,
    coverColor: work.coverColor,
    coverTemplate: work.coverTemplate,
    status: work.status,
    reviewNote: work.reviewNote,
  };

  return (
    <main className="min-h-screen">
      <DashboardNav role="WRITER" />
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
        <Link href={`/dashboard/works/${work.id}`} className="inline-flex items-center text-sm text-[#9ba5c0] hover:text-[#e8ecf4]">
          ← Back to work details
        </Link>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Editor studio</p>
          <h1 className="mt-2 font-serif text-4xl text-[#e8ecf4]">
            Edit {work.type === "STORY" ? "Story" : work.type === "POETRY" ? "Poem" : "Song"}.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-7 text-[#9ba5c0]">
            Update your text, artwork, or submit your draft for admin review.
          </p>
        </div>
        <div className="mt-8">
          <WriterWorkForm initialWork={initialWork} />
        </div>
      </section>
    </main>
  );
}

