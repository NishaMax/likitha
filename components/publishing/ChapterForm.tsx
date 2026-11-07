"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChapterForm({ workId }: { workId: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submit, setSubmit] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function saveChapter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch(`/api/works/${workId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, submit }),
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) {
        setError(body.error ?? "Unable to save chapter.");
        return;
      }
      router.push(`/dashboard/works/${workId}`);
      router.refresh();
    } catch {
      setError("Unable to reach Likitha. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={saveChapter} className="max-w-2xl space-y-6">
      <label className="block text-sm text-[#c4cada]">Chapter title
        <input value={title} onChange={(event) => setTitle(event.target.value)} minLength={2} maxLength={120} required className="mt-2 min-h-12 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
      </label>
      <label className="block text-sm text-[#c4cada]">Chapter content
        <textarea value={content} onChange={(event) => setContent(event.target.value)} minLength={20} maxLength={100000} required rows={16} className="mt-2 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 py-3 font-sinhala leading-8 text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
      </label>
      {error && <p role="alert" className="rounded-lg border border-[#f87171]/30 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" onClick={() => setSubmit(false)} disabled={saving} className="min-h-12 rounded-lg border border-[#30384e] px-5 text-sm text-[#c8a96e] disabled:opacity-60">Save draft</button>
        <button type="submit" onClick={() => setSubmit(true)} disabled={saving} className="min-h-12 rounded-lg bg-[#c8a96e] px-5 font-semibold text-[#0f1117] disabled:opacity-60">{saving ? "Saving..." : "Submit chapter"}</button>
      </div>
    </form>
  );
}
