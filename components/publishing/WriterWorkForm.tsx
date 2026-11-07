"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { artworkTemplates, defaultArtworkTemplate, getArtworkTemplateClass, type ArtworkTemplate } from "@/lib/artwork";

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
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverColor, setCoverColor] = useState("#334c50");
  const [coverTemplate, setCoverTemplate] = useState<ArtworkTemplate>(defaultArtworkTemplate);
  const [submit, setSubmit] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function chooseCover(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP cover image.");
      return;
    }
    if (file.size > 1_000_000) {
      setError("Cover images must be smaller than 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCoverImageUrl(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => setError("We could not read that cover image. Please try again.");
    reader.readAsDataURL(file);
  }

  async function saveWork(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, description, genre, content, coverImageUrl, coverColor, coverTemplate, submit }),
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
      <div className="rounded-2xl border border-[#30384e] bg-[#171b26] p-5">
        <p className="text-sm font-semibold text-[#e8ecf4]">Story artwork <span className="font-normal text-[#6f7890]">(optional)</span></p>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row">
          <div className={`relative flex h-48 w-full shrink-0 items-end overflow-hidden rounded-xl bg-gradient-to-br ${getArtworkTemplateClass(coverTemplate)} p-4 sm:w-36`} style={{ backgroundColor: coverColor }}>
            {coverImageUrl && <Image src={coverImageUrl} alt="" fill className="object-cover" unoptimized />}
            <span className="relative z-10 line-clamp-2 font-sinhala text-lg font-bold text-[#f4ead8]">{title || "Your cover"}</span>
          </div>
          <div className="space-y-4">
            <label htmlFor="cover-image" className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-[#c8a96e]/50 px-4 text-sm font-semibold text-[#c8a96e] hover:bg-[#c8a96e]/10">
              Upload cover image
              <input id="cover-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseCover} className="sr-only" />
            </label>
            <p className="text-xs leading-5 text-[#6f7890]">JPG, PNG, or WebP. Maximum 1 MB. If you skip it, choose a template and color.</p>
            <div className="flex flex-wrap gap-2">
              {artworkTemplates.map((template) => (
                <button key={template.value} type="button" onClick={() => setCoverTemplate(template.value)} className={`min-h-11 rounded-lg border px-3 text-xs ${coverTemplate === template.value ? "border-[#c8a96e] text-[#c8a96e]" : "border-[#30384e] text-[#9ba5c0]"}`}>{template.label}</button>
              ))}
            </div>
            <label className="flex items-center gap-3 text-xs text-[#9ba5c0]">Fallback color
              <input type="color" value={coverColor} onChange={(event) => setCoverColor(event.target.value)} className="h-10 w-14 cursor-pointer rounded border border-[#30384e] bg-transparent" />
            </label>
          </div>
        </div>
      </div>
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
