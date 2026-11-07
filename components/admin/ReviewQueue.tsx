"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ReviewItem = {
  id: string;
  title: string;
  description?: string;
  content?: string | null;
  type?: string;
  chapterNo?: number;
  workTitle?: string;
  author: string;
  submittedAt: string | null;
};

type ReviewQueueProps = {
  works: ReviewItem[];
  chapters: ReviewItem[];
};

export default function ReviewQueue({ works, chapters }: ReviewQueueProps) {
  const [note, setNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function review(entityType: "work" | "chapter", entityId: string, action: "approve" | "reject") {
    setBusy(entityId);
    setError("");
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, action, note: note[entityId] }),
      });
      if (!response.ok) {
        const body = await response.json() as { error?: string };
        setError(body.error ?? "Unable to update this review.");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to reach Likitha. Try again.");
    } finally {
      setBusy("");
    }
  }

  function card(item: ReviewItem, entityType: "work" | "chapter") {
    return (
      <article key={item.id} className="rounded-2xl border border-[#252d40] bg-[#171b26] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[.15em] text-[#c8a96e]">{entityType === "work" ? item.type : `Chapter ${item.chapterNo}`}</p>
            <h3 className="mt-3 font-sinhala text-xl text-[#e8ecf4]">{item.title}</h3>
            {item.workTitle && <p className="mt-1 text-xs text-[#9ba5c0]">From: {item.workTitle}</p>}
            <p className="mt-2 text-sm text-[#9ba5c0]">by {item.author}</p>
          </div>
          <span className="text-xs text-[#6f7890]">{item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : ""}</span>
        </div>
        {item.description && <p className="mt-5 text-sm leading-7 text-[#c4cada]">{item.description}</p>}
        {item.content && <p className="mt-4 max-h-40 overflow-y-auto whitespace-pre-line rounded-lg bg-[#12151e] p-4 font-sinhala text-sm leading-7 text-[#9ba5c0]">{item.content}</p>}
        <textarea value={note[item.id] ?? ""} onChange={(event) => setNote((current) => ({ ...current, [item.id]: event.target.value }))} maxLength={1000} rows={2} placeholder="Optional feedback for the writer..." className="mt-5 w-full rounded-lg border border-[#30384e] bg-[#12151e] px-3 py-2 text-sm text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => void review(entityType, item.id, "approve")} disabled={busy === item.id} className="min-h-11 rounded-lg bg-[#86efac] px-4 text-sm font-semibold text-[#102218] disabled:opacity-60">{busy === item.id ? "Saving..." : "Approve"}</button>
          <button type="button" onClick={() => void review(entityType, item.id, "reject")} disabled={busy === item.id} className="min-h-11 rounded-lg border border-[#f87171]/40 px-4 text-sm font-semibold text-[#fca5a5] disabled:opacity-60">Reject</button>
        </div>
      </article>
    );
  }

  return (
    <div>
      {error && <p role="alert" className="mb-6 rounded-lg border border-[#f87171]/30 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>}
      <section>
        <div className="flex items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[.15em] text-[#c8a96e]">Works</p><h2 className="mt-2 font-serif text-2xl text-[#e8ecf4]">Pending works</h2></div><span className="text-sm text-[#6f7890]">{works.length}</span></div>
        {works.length ? <div className="mt-5 grid gap-4 lg:grid-cols-2">{works.map((item) => card(item, "work"))}</div> : <p className="mt-4 text-sm text-[#6f7890]">No works waiting for review.</p>}
      </section>
      <section className="mt-12">
        <div className="flex items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[.15em] text-[#c8a96e]">Chapters</p><h2 className="mt-2 font-serif text-2xl text-[#e8ecf4]">Pending chapters</h2></div><span className="text-sm text-[#6f7890]">{chapters.length}</span></div>
        {chapters.length ? <div className="mt-5 grid gap-4 lg:grid-cols-2">{chapters.map((item) => card(item, "chapter"))}</div> : <p className="mt-4 text-sm text-[#6f7890]">No chapters waiting for review.</p>}
      </section>
    </div>
  );
}
