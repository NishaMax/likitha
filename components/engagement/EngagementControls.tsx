"use client";

import { useEffect, useState } from "react";

export default function EngagementControls({ workId }: { workId: string }) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
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
    try {
      const response = await fetch("/api/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, workId }),
      });
      const body = await response.json() as { likes?: number; liked?: boolean; saved?: boolean; error?: string };
      if (!response.ok) { setError(body.error ?? "Sign in to use this feature."); return; }
      setLikes(body.likes ?? likes); setLiked(Boolean(body.liked)); setSaved(Boolean(body.saved));
    } catch { setError("Unable to reach Likitha. Try again."); }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => void toggle("like")} className={`min-h-11 rounded-lg border px-4 text-sm ${liked ? "border-[#fda4af]/50 bg-[#fda4af]/10 text-[#fda4af]" : "border-[#30384e] text-[#e8ecf4]"}`}>
          {liked ? "♥ Liked" : "♡ Like"} {likes > 0 && `· ${likes}`}
        </button>
        <button type="button" onClick={() => void toggle("save")} className={`min-h-11 rounded-lg border px-4 text-sm ${saved ? "border-[#c8a96e]/50 bg-[#c8a96e]/10 text-[#c8a96e]" : "border-[#30384e] text-[#e8ecf4]"}`}>
          {saved ? "✓ Saved" : "＋ Save"}
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-xs text-[#fca5a5]">{error}</p>}
    </div>
  );
}
