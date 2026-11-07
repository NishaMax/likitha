import Link from "next/link";
import { notFound } from "next/navigation";
import { works } from "@/lib/stories";
import PublicNav from "@/components/navigation/PublicNav";
import ReadingProgressButton from "@/components/reading/ReadingProgressButton";

type WorkPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return works.filter((work) => work.type !== "Stories").map((work) => ({ id: work.id }));
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { id } = await params;
  const work = works.find((item) => item.id === id && item.type !== "Stories");

  if (!work) notFound();

  const label = work.type === "Poetry" ? "Poetry" : "Song lyrics";

  return (
    <main className="min-h-screen">
      <PublicNav />
      <section className="relative overflow-hidden border-y border-[#202638] bg-[#12151e]">
        <div className={`absolute inset-0 bg-gradient-to-br ${work.color} opacity-20`} />
        <div className="relative mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-20">
          <div className={`flex min-h-72 items-end rounded-2xl bg-gradient-to-br ${work.color} p-6 sm:min-h-96 sm:p-10`}>
            <div>
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
            මෙම {work.type === "Poetry" ? "කවිය" : "ගී පදය"} ඉදිරියේදී සම්පූර්ණයෙන් කියවීමට හැකි වේ.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ReadingProgressButton workId={work.id} workType={work.type === "Poetry" ? "POETRY" : "SONG"} />
          <Link href="/browse" className="inline-flex min-h-11 items-center rounded-lg border border-[#30384e] px-4 text-sm text-[#c8a96e] hover:border-[#c8a96e]">
            ← Back to discover
          </Link>
        </div>
      </article>
    </main>
  );
}
