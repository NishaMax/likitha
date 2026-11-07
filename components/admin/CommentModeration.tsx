"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CommentItem = {
  id: string;
  content: string;
  isHidden: boolean;
  createdAt: string;
  workId: string;
  user: { displayName: string; email: string };
};

export default function CommentModeration({ comments }: { comments: CommentItem[] }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function moderate(commentId: string, action: "hide" | "unhide" | "delete") {
    setBusy(commentId);
    setError("");
    try {
      const response = await fetch("/api/admin/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, action }),
      });
      if (!response.ok) {
        const body = await response.json() as { error?: string };
        setError(body.error ?? "Unable to moderate this comment.");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to reach Likitha. Try again.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[.15em] text-[#c8a96e]">Community safety</p>
          <h2 className="mt-2 font-serif text-2xl text-[#e8ecf4]">Comment moderation</h2>
        </div>
        <span className="text-sm text-[#6f7890]">{comments.length}</span>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg border border-[#f87171]/30 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>}
      {comments.length ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {comments.map((comment) => (
            <article key={comment.id} className={`rounded-2xl border p-5 ${comment.isHidden ? "border-[#f87171]/30 bg-[#24191d]" : "border-[#252d40] bg-[#171b26]"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#e8ecf4]">{comment.user.displayName}</p>
                  <p className="mt-1 text-xs text-[#6f7890]">{comment.user.email}</p>
                </div>
                <span className="text-xs text-[#6f7890]">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#c4cada]">{comment.content}</p>
              {comment.isHidden && <p className="mt-3 text-xs font-semibold text-[#fca5a5]">Hidden from readers</p>}
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" disabled={busy === comment.id} onClick={() => void moderate(comment.id, comment.isHidden ? "unhide" : "hide")} className="min-h-11 rounded-lg border border-[#30384e] px-4 text-sm text-[#c8a96e] disabled:opacity-60">
                  {comment.isHidden ? "Unhide" : "Hide"}
                </button>
                <button type="button" disabled={busy === comment.id} onClick={() => void moderate(comment.id, "delete")} className="min-h-11 rounded-lg border border-[#f87171]/40 px-4 text-sm text-[#fca5a5] disabled:opacity-60">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : <p className="mt-4 text-sm text-[#6f7890]">No comments to moderate.</p>}
    </section>
  );
}
