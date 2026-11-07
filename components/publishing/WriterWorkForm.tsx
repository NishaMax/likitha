"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const types = [
  { value: "STORY", label: "Story" },
  { value: "POETRY", label: "Poetry" },
  { value: "SONG", label: "Song" },
] as const;

export default function WriterWorkForm() {
  const [type, setType] = useState<(typeof types)[number]["value"]>("STORY");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [content, setContent] = useState("");
  const [submit, setSubmit] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function saveWork(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, description, genre, content, submit }),
      });
      const body = await response.json() as { work?: { id: string }; error?: string };
      if (!response.ok || !body.work) {
        setError(body.error ?? "Unable to save this work.");
        return;
      }
      router.push(`/dashboard/works/${body.work.id}`);
      router.refresh();
    } catch {
      setError("Unable to reach Likitha. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={saveWork} className="max-w-2xl space-y-6">
      <div>
        <p className="mb-3 text-sm text-[#c4cada]">What are you publishing?</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {types.map((item) => (
            <button key={item.value} type="button" onClick={() => setType(item.value)} className={`min-h-12 rounded-lg border px-4 text-sm font-semibold ${type === item.value ? "border-[#c8a96e] bg-[#c8a96e] text-[#0f1117]" : "border-[#30384e] text-[#9ba5c0]"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <label className="block text-sm text-[#c4cada]">Title
        <input value={title} onChange={(event) => setTitle(event.target.value)} minLength={2} maxLength={120} required className="mt-2 min-h-12 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
      </label>
      <label className="block text-sm text-[#c4cada]">Genre
        <input value={genre} onChange={(event) => setGenre(event.target.value)} maxLength={40} required placeholder="Romance, nature, drama..." className="mt-2 min-h-12 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
      </label>
      <label className="block text-sm text-[#c4cada]">Short description
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} minLength={10} maxLength={1000} required rows={4} className="mt-2 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 py-3 leading-7 text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
      </label>
      {type !== "STORY" && (
        <label className="block text-sm text-[#c4cada]">{type === "POETRY" ? "Poem" : "Lyrics"}
          <textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={100000} rows={10} placeholder="Write your Sinhala content here..." className="mt-2 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 py-3 font-sinhala leading-8 text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
        </label>
      )}
      {error && <p role="alert" className="rounded-lg border border-[#f87171]/30 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" onClick={() => setSubmit(false)} disabled={saving} className="min-h-12 rounded-lg border border-[#30384e] px-5 text-sm text-[#c8a96e] disabled:opacity-60">Save draft</button>
        <button type="submit" onClick={() => setSubmit(true)} disabled={saving} className="min-h-12 rounded-lg bg-[#c8a96e] px-5 font-semibold text-[#0f1117] disabled:opacity-60">{saving ? "Saving..." : "Submit for approval"}</button>
      </div>
    </form>
  );
}
