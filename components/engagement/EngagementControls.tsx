"use client";

import { useEffect, useState } from "react";

export default function EngagementControls({ workId }: { workId: string }) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/engagement?workId=${encodeURIComponent(workId)}`)
      .then(async (response) => {
        if (!response.ok) return;
        const body = await response.json() as { likes: number; liked: boolean; saved: boolean };
        setLikes(body.likes); setLiked(body.liked); setSaved(body.saved);
      })
      .catch(() => undefined);
  }, [workId]);

  async function toggle(action: "like" | "save") {
    setError("");

    // Optimistic UI update — apply the change immediately before the API responds
    if (action === "like") {
      const nextLiked = !liked;
      setLiked(nextLiked);
      setLikes((prev) => prev + (nextLiked ? 1 : -1));
      // Trigger the pop animation
      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 300);
    } else {
      setSaved((prev) => !prev);
    }

    try {
      const response = await fetch("/api/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, workId }),
      });
      const body = await response.json() as { likes?: number; liked?: boolean; saved?: boolean; error?: string };
      if (!response.ok) {
        // Revert the optimistic update on failure
        if (action === "like") {
          setLiked((prev) => !prev);
          setLikes((prev) => prev + (liked ? 1 : -1));
        } else {
          setSaved((prev) => !prev);
        }
        setError(body.error ?? "Sign in to use this feature.");
        return;
      }
      // Sync with server truth
      if (body.likes !== undefined) setLikes(body.likes);
      if (body.liked !== undefined) setLiked(Boolean(body.liked));
      if (body.saved !== undefined) setSaved(Boolean(body.saved));
    } catch {
      // Revert on network error
      if (action === "like") {
        setLiked((prev) => !prev);
        setLikes((prev) => prev + (liked ? 1 : -1));
      } else {
        setSaved((prev) => !prev);
      }
      setError("Unable to reach Likitha. Try again.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void toggle("like")}
          className={`min-h-11 rounded-lg border px-4 text-sm transition-all duration-150 ${
            liked
              ? "border-[#fda4af]/50 bg-[#fda4af]/10 text-[#fda4af]"
              : "border-[#30384e] text-[#e8ecf4] hover:border-[#fda4af]/40 hover:text-[#fda4af]"
          }`}
          aria-pressed={liked}
        >
          <span
            className={`inline-block transition-transform duration-150 ${
              likeAnimating ? "scale-125" : "scale-100"
            }`}
          >
            {liked ? "♥" : "♡"}
          </span>
          {" "}{liked ? "Liked" : "Like"}{likes > 0 && ` · ${likes}`}
        </button>
        <button
          type="button"
          onClick={() => void toggle("save")}
          className={`min-h-11 rounded-lg border px-4 text-sm transition-all duration-150 ${
            saved
              ? "border-[#c8a96e]/50 bg-[#c8a96e]/10 text-[#c8a96e]"
              : "border-[#30384e] text-[#e8ecf4] hover:border-[#c8a96e]/40"
          }`}
          aria-pressed={saved}
        >
          {saved ? "✓ Saved" : "＋ Save"}
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-xs text-[#fca5a5]">{error}</p>}
    </div>
  );
}
