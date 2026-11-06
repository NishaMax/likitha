"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { genres, SortOption, stories, type Genre } from "@/lib/stories";

function StoryCard({ story }: { story: (typeof stories)[number] }) {
  return (
    <Link
      href={`/story/${story.id}`}
      className="group rounded-2xl border border-[#252d40] bg-[#171b26] p-3 transition hover:-translate-y-1 hover:border-[#c8a96e]/50"
    >
      <div className={`flex h-48 items-end rounded-xl bg-gradient-to-br ${story.color} p-4 sm:h-56`}>
        <div>
          <span className="rounded-full bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[.15em] text-[#e9d8b7]">
            {story.genre}
          </span>
          <h2 className="mt-3 font-sinhala text-xl font-bold leading-relaxed text-[#f4ead8]">
            {story.title}
          </h2>
        </div>
      </div>
      <div className="px-1 pb-1 pt-4">
        <p className="text-sm text-[#9ba5c0]">by {story.author}</p>
        <p className="mt-2 line-clamp-2 font-sinhala text-sm leading-7 text-[#6f7890]">{story.description}</p>
        <div className="mt-4 flex items-center justify-between border-t border-[#252d40] pt-3 text-xs text-[#6f7890]">
          <span>{story.chapters} chapters</span>
          <span>{story.readers} readers</span>
        </div>
      </div>
    </Link>
  );
}

export default function BrowsePage() {
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<Genre>("All stories");
  const [sort, setSort] = useState<SortOption>("Trending");

  const filteredStories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = stories.filter((story) => {
      const matchesGenre = selectedGenre === "All stories" || story.genre === selectedGenre;
      const matchesQuery =
        !normalizedQuery ||
        story.title.toLowerCase().includes(normalizedQuery) ||
        story.author.toLowerCase().includes(normalizedQuery) ||
        story.description.toLowerCase().includes(normalizedQuery);
      return matchesGenre && matchesQuery;
    });

    if (sort === "Newest") return [...result].reverse();
    if (sort === "Most read") return [...result].sort((a, b) => b.readers.localeCompare(a.readers));
    return result;
  }, [query, selectedGenre, sort]);

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="font-serif text-2xl tracking-tight text-[#e8ecf4]" aria-label="Likitha home">
          likitha<span className="text-[#c8a96e]">.</span>
        </Link>
        <Link href="/" className="flex min-h-11 items-center rounded-full px-3 text-sm text-[#9ba5c0] transition hover:text-[#e8ecf4]">
          ← Home
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-10 pt-10 sm:px-8 sm:pt-16 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">The library</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-[#e8ecf4] sm:text-5xl">Find your next story.</h1>
        <p className="mt-4 max-w-xl font-sinhala text-base leading-8 text-[#9ba5c0]">
          ඔබේ මීළඟ ප්‍රියතම කතාව මෙතැනින් සොයාගන්න.
        </p>

        <div className="mt-8 flex min-h-12 items-center rounded-xl border border-[#30384e] bg-[#171b26] px-4 focus-within:border-[#c8a96e]/70">
          <span className="mr-3 text-lg text-[#c8a96e]" aria-hidden="true">⌕</span>
          <label htmlFor="story-search" className="sr-only">Search stories</label>
          <input
            id="story-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search stories, writers..."
            className="w-full bg-transparent text-sm text-[#e8ecf4] outline-none placeholder:text-[#6f7890]"
          />
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
              <span className="font-semibold text-[#e8ecf4]">{filteredStories.length}</span> stories to explore
            </p>
            <label className="flex items-center gap-2 text-sm text-[#6f7890]">
              <span className="hidden sm:inline">Sort by</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                className="min-h-11 rounded-lg border border-[#30384e] bg-[#171b26] px-3 text-[#e8ecf4] outline-none focus:border-[#c8a96e]"
                aria-label="Sort stories"
              >
                <option>Trending</option>
                <option>Newest</option>
                <option>Most read</option>
              </select>
            </label>
          </div>

          {filteredStories.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStories.map((story) => <StoryCard key={story.id} story={story} />)}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-[#30384e] px-5 py-16 text-center">
              <p className="font-sinhala text-lg text-[#e8ecf4]">කතා හමු වුණේ නැහැ.</p>
              <p className="mt-2 text-sm text-[#6f7890]">Try another search or genre.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
