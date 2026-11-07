"use client";

import { useEffect, useState } from "react";

type Comment = { id: string; content: string; createdAt: string; user: { displayName: string } };

export default function CommentsSection({ workId }: { workId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch(`/api/comments?workId=${encodeURIComponent(workId)}`);
    if (response.ok) setComments((await response.json() as { comments: Comment[] }).comments);
  }
  useEffect(() => {
    let active = true;
    fetch(`/api/comments?workId=${encodeURIComponent(workId)}`)
      .then(async (response) => {
        if (response.ok && active) setComments((await response.json() as { comments: Comment[] }).comments);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [workId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    try {
      const response = await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workId, content }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) { setError(body.error ?? "Unable to post comment."); return; }
      setContent(""); await load();
    } catch { setError("Unable to reach Likitha. Try again."); }
  }

  return (
    <section className="mt-12">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Community</p>
      <h2 className="mt-3 font-serif text-3xl text-[#e8ecf4]">Comments</h2>
      <form onSubmit={submit} className="mt-5">
        <textarea value={content} onChange={(event) => setContent(event.target.value)} minLength={2} maxLength={1000} rows={3} placeholder="Share your thoughts..." className="w-full rounded-xl border border-[#30384e] bg-[#171b26] px-4 py-3 text-sm leading-7 text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
        <div className="mt-3 flex items-center justify-between gap-3"><button type="submit" className="min-h-11 rounded-lg bg-[#c8a96e] px-4 text-sm font-semibold text-[#0f1117]">Post comment</button>{error && <p role="alert" className="text-xs text-[#fca5a5]">{error}</p>}</div>
      </form>
      <div className="mt-6 divide-y divide-[#252d40]">{comments.map((comment) => <article key={comment.id} className="py-4"><p className="text-xs font-semibold text-[#c8a96e]">{comment.user.displayName}</p><p className="mt-2 text-sm leading-7 text-[#c4cada]">{comment.content}</p></article>)}{comments.length === 0 && <p className="py-6 text-sm text-[#6f7890]">Be the first to comment.</p>}</div>
    </section>
  );
}
