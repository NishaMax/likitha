"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type WorkManagementControlsProps = {
  workId: string;
  status: string;
  workTitle: string;
};

export function WorkActionsBar({ workId, status, workTitle }: WorkManagementControlsProps) {
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleHide() {
    if (!confirm("Hide this work from the public catalog? It will be switched back to private draft.")) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/works/${workId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hide" }),
      });
      if (!response.ok) {
        const body = await response.json() as { error?: string };
        setError(body.error ?? "Failed to hide work.");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to connect. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/works/${workId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json() as { error?: string };
        setError(body.error ?? "Failed to delete work.");
        setBusy(false);
        return;
      }
      window.location.href = "/dashboard/works";
    } catch {
      setError("Unable to connect. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="rounded-lg border border-[#f87171]/40 bg-[#f87171]/10 px-3 py-2 text-xs text-[#fca5a5]">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {status === "APPROVED" && (
          <button
            type="button"
            onClick={handleHide}
            disabled={busy}
            className="inline-flex min-h-10 items-center rounded-lg border border-[#30384e] bg-[#12151e] px-3.5 text-xs text-[#9ba5c0] transition hover:border-[#c8a96e] hover:text-[#e8ecf4] disabled:opacity-50"
            title="Make private so readers cannot see it"
          >
            {busy ? "Updating..." : "Hide from public"}
          </button>
        )}

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            className="inline-flex min-h-10 items-center rounded-lg border border-[#f87171]/30 bg-[#12151e] px-3.5 text-xs text-[#fca5a5] transition hover:border-[#f87171] hover:bg-[#f87171]/10 disabled:opacity-50"
          >
            Delete work
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-[#f87171]/50 bg-[#1f1618] p-1.5">
            <span className="text-xs text-[#fca5a5]">Delete &ldquo;{workTitle}&rdquo;?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="rounded bg-[#f87171] px-2.5 py-1 text-xs font-semibold text-[#180a0a] hover:bg-[#fca5a5] disabled:opacity-50"
            >
              {busy ? "Deleting..." : "Yes, delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={busy}
              className="rounded border border-[#30384e] px-2.5 py-1 text-xs text-[#9ba5c0] hover:text-[#e8ecf4]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function DeleteChapterButton({ workId, chapterId, chapterNo }: { workId: string; chapterId: string; chapterNo: number }) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setBusy(true);
    try {
      const response = await fetch(`/api/works/${workId}/chapters/${chapterId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        alert("Unable to delete chapter.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      alert("Connection error. Try again.");
      setBusy(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-[#fca5a5]">Delete Ch. {chapterNo}?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="rounded bg-[#f87171] px-2 py-0.5 text-[11px] font-semibold text-[#180a0a] hover:bg-[#fca5a5]"
        >
          {busy ? "..." : "Delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={busy}
          className="text-[#9ba5c0] hover:text-[#e8ecf4]"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex min-h-8 items-center rounded-lg border border-[#f87171]/30 px-2.5 text-xs text-[#fca5a5] hover:border-[#f87171] hover:bg-[#f87171]/10"
      title={`Delete Chapter ${chapterNo}`}
    >
      Delete
    </button>
  );
}

