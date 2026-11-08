"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { contentTypes, genres, SortOption, type ContentTypeFilter, type Genre, type Work } from "@/lib/content";
import PublicNav from "@/components/navigation/PublicNav";

function WorkCard({ work, isRead }: { work: Work; isRead: boolean }) {
  const isStory = work.type === "Stories";
  return (
    <Link
      href={isStory ? `/story/${work.id}` : `/work/${work.id}`}
      className="group rounded-2xl border border-[#252d40] bg-[#171b26] p-3 transition hover:-translate-y-1 hover:border-[#c8a96e]/50"
    >
      <div className={`flex h-48 items-end rounded-xl bg-gradient-to-br ${work.color} p-4 sm:h-56`}>
        <div>
          {isRead && <span className="mb-2 block w-fit rounded-full bg-[#86efac]/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.15em] text-[#bbf7d0]">Read</span>}
          <span className="rounded-full bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[.15em] text-[#e9d8b7]">
            {work.type === "Stories" ? "Story" : work.type === "Poetry" ? "Poetry" : "Song"}
          </span>
          <h2 className="mt-3 font-sinhala text-xl font-bold leading-relaxed text-[#f4ead8]">
            {work.title}
          </h2>
        </div>
      </div>
      <div className="px-1 pb-1 pt-4">
        <p className="text-sm text-[#9ba5c0]">by {work.author}</p>
        <p className="mt-2 line-clamp-2 font-sinhala text-sm leading-7 text-[#6f7890]">{work.description}</p>
        <div className="mt-4 flex items-center justify-between border-t border-[#252d40] pt-3 text-xs text-[#6f7890]">
          <span>{isStory ? `${work.chapters} chapters` : work.type === "Poetry" ? "Poem" : "Lyrics"}</span>
          <span>{work.likes ?? work.readers} {work.likes !== undefined ? "likes" : "reads"}</span>
        </div>
      </div>
    </Link>
  );
}

export default function BrowsePage() {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ContentTypeFilter>("All");
  const [selectedGenre, setSelectedGenre] = useState<Genre>("All genres");
  const [sort, setSort] = useState<SortOption>("Trending");
  const [readWorkIds, setReadWorkIds] = useState<Set<string>>(new Set());
  const [allWorks, setAllWorks] = useState<Work[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/public/works")
      .then(async (response) => {
        if (!response.ok) return;
        const body = await response.json() as { works?: Work[] };
        if (active && body.works) setAllWorks(body.works);
      })
      .catch(() => {
        // An unavailable catalog is shown as an empty state.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/reading-progress")
      .then(async (response) => {
        if (!response.ok) return;
        const body = await response.json() as { progress?: Array<{ workId: string; completed: boolean }> };
        if (active) setReadWorkIds(new Set((body.progress ?? []).filter((item) => item.completed).map((item) => item.workId)));
      })
      .catch(() => {
        // Signed-out visitors can browse without reading history.
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredWorks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = allWorks.filter((work) => {
      const matchesType = selectedType === "All" || work.type === selectedType;
      const matchesGenre = selectedGenre === "All genres" || work.genre === selectedGenre;
      const matchesQuery =
        !normalizedQuery ||
        work.title.toLowerCase().includes(normalizedQuery) ||
        work.author.toLowerCase().includes(normalizedQuery) ||
        work.description.toLowerCase().includes(normalizedQuery);
      return matchesType && matchesGenre && matchesQuery;
    });

    if (sort === "Newest") return [...result].reverse();
    if (sort === "Most read") return [...result].sort((a, b) => b.readers.localeCompare(a.readers));
    return result;
  }, [allWorks, query, selectedGenre, selectedType, sort]);

  return (
    <main className="min-h-screen">
      <PublicNav />

      <section className="mx-auto max-w-6xl px-5 pb-10 pt-10 sm:px-8 sm:pt-16 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">The library</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-[#e8ecf4] sm:text-5xl">Find your next favourite.</h1>
        <p className="mt-4 max-w-xl font-sinhala text-base leading-8 text-[#9ba5c0]">
          කතා, කවි සහ ගීත අතරින් ඔබේ මීළඟ ප්‍රියතම නිර්මාණය සොයාගන්න.
        </p>

        <div className="mt-8 flex min-h-12 items-center rounded-xl border border-[#30384e] bg-[#171b26] px-4 focus-within:border-[#c8a96e]/70">
          <span className="mr-3 text-lg text-[#c8a96e]" aria-hidden="true">⌕</span>
          <label htmlFor="story-search" className="sr-only">Search works</label>
          <input
            id="story-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search stories, poetry, songs..."
            className="w-full bg-transparent text-sm text-[#e8ecf4] outline-none placeholder:text-[#6f7890]"
          />
        </div>

        <div id="genres" className="mt-6 -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {contentTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`min-h-11 shrink-0 rounded-lg px-4 text-sm font-semibold transition ${
                selectedType === type
                  ? "bg-[#c8a96e] text-[#0f1117]"
                  : "border border-[#30384e] text-[#9ba5c0] hover:border-[#c8a96e]/60 hover:text-[#e8ecf4]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="mt-6 -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setSelectedGenre(genre)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm transition ${
                selectedGenre === genre
                  ? "border-[#c8a96e] bg-[#c8a96e] text-[#0f1117]"
                  : "border-[#30384e] text-[#9ba5c0] hover:border-[#c8a96e]/60 hover:text-[#e8ecf4]"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      <section className="border-t border-[#202638] bg-[#12151e]">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-[#9ba5c0]">
              <span className="font-semibold text-[#e8ecf4]">{filteredWorks.length}</span> works to explore
            </p>
            <label className="flex items-center gap-2 text-sm text-[#6f7890]">
              <span className="hidden sm:inline">Sort by</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                className="min-h-11 rounded-lg border border-[#30384e] bg-[#171b26] px-3 text-[#e8ecf4] outline-none focus:border-[#c8a96e]"
                aria-label="Sort works"
              >
                <option>Trending</option>
                <option>Newest</option>
                <option>Most read</option>
              </select>
            </label>
          </div>

          {filteredWorks.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWorks.map((work) => <WorkCard key={work.id} work={work} isRead={readWorkIds.has(work.id)} />)}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-[#30384e] px-5 py-16 text-center">
              <p className="font-sinhala text-lg text-[#e8ecf4]">{allWorks.length === 0 ? "පළමු නිර්මාණය බලාපොරොත්තුවෙන් සිටී." : "නිර්මාණ හමු වුණේ නැහැ."}</p>
              <p className="mt-2 text-sm text-[#6f7890]">{allWorks.length === 0 ? "The library is waiting for its first stories." : "Try another search, type, or genre."}</p>
              {allWorks.length === 0 && <Link href="/auth?mode=register" className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-[#E4BD70]/50 px-4 text-sm text-[#E4BD70]">Create an account</Link>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
