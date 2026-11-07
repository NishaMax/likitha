"use client";

import { useEffect, useState } from "react";

type ReadingProgressButtonProps = {
  workId: string;
  workType: "STORY" | "POETRY" | "SONG";
  chapterNumber?: number;
  totalChapters?: number;
  autoTrack?: boolean;
};

export default function ReadingProgressButton({
  workId,
  workType,
  chapterNumber,
  totalChapters,
  autoTrack = false,
}: ReadingProgressButtonProps) {
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(autoTrack);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/reading-progress?workId=${encodeURIComponent(workId)}`)
      .then(async (response) => {
        if (!response.ok) return;
        const body = await response.json() as { progress?: Array<{ completed?: boolean }> };
        if (active) setCompleted(Boolean(body.progress?.[0]?.completed));
      })
      .catch(() => {
        // Reading progress is optional for signed-out visitors.
      });
    return () => {
      active = false;
    };
  }, [workId]);

  async function saveProgress(markCompleted = false) {
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/reading-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workId, workType, chapterNumber, totalChapters, completed: markCompleted }),
      });
      const body = await response.json() as { progress?: { completed?: boolean }; error?: string };
      if (!response.ok) {
        setError(body.error ?? "Unable to save reading progress.");
        return;
      }
      setCompleted(Boolean(body.progress?.completed));
    } catch {
      setError("Unable to reach Likitha. Try again.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!autoTrack) return;
    let active = true;
    fetch("/api/reading-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workId, workType, chapterNumber, totalChapters }),
    })
      .then(async (response) => {
        const body = await response.json() as { progress?: { completed?: boolean }; error?: string };
        if (!active) return;
        if (!response.ok) {
          setError(body.error ?? "Unable to save reading progress.");
        } else {
          setCompleted(Boolean(body.progress?.completed));
        }
        setSaving(false);
      })
      .catch(() => {
        if (active) {
          setError("Unable to reach Likitha. Try again.");
          setSaving(false);
        }
      });
    return () => {
      active = false;
    };
  }, [autoTrack, chapterNumber, totalChapters, workId, workType]);

  if (autoTrack) {
    return (
      <div className="text-right">
        <p className="text-xs text-[#6f7890]">{saving ? "Saving progress..." : "Progress saved"}</p>
        {error && <p className="mt-2 text-xs text-[#fca5a5]">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void saveProgress(true)}
        disabled={completed || saving}
        className="flex min-h-12 items-center justify-center rounded-lg border border-[#30384e] px-6 font-medium text-[#e8ecf4] transition hover:border-[#c8a96e]/60 disabled:cursor-default disabled:border-[#86efac]/40 disabled:text-[#bbf7d0]"
      >
        {saving ? "Saving..." : completed ? "✓ Marked as read" : "Mark as read"}
      </button>
      {error && <p role="alert" className="mt-3 text-xs text-[#fca5a5]">{error}</p>}
    </div>
  );
}
