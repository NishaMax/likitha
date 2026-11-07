"use client";

import { useEffect, useState } from "react";

export default function FollowButton({ username }: { username: string }) {
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => { fetch(`/api/follow?username=${encodeURIComponent(username)}`).then(async (r) => { if (r.ok) { const b = await r.json() as { following: boolean; followers: number }; setFollowing(b.following); setFollowers(b.followers); } }).catch(() => undefined); }, [username]);
  async function toggle() {
    setError("");
    try {
      const response = await fetch("/api/follow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username }) });
      const body = await response.json() as { following?: boolean; followers?: number; error?: string };
      if (!response.ok) { setError(body.error ?? "Sign in to follow writers."); return; }
      setFollowing(Boolean(body.following)); setFollowers(body.followers ?? followers);
    } catch { setError("Unable to reach Likitha. Try again."); }
  }
  return <div><button type="button" onClick={() => void toggle()} className={`min-h-11 rounded-lg border px-4 text-sm ${following ? "border-[#c8a96e] text-[#c8a96e]" : "border-[#30384e] text-[#e8ecf4]"}`}>{following ? "Following" : "Follow writer"}</button><span className="ml-3 text-xs text-[#6f7890]">{followers} followers</span>{error && <p className="mt-2 text-xs text-[#fca5a5]">{error}</p>}</div>;
}
