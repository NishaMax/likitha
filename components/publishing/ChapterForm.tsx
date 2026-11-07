"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { artworkTemplates, defaultArtworkTemplate, getArtworkTemplateClass, type ArtworkTemplate } from "@/lib/artwork";

export default function ChapterForm({ workId }: { workId: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageColor, setImageColor] = useState("#334c50");
  const [imageTemplate, setImageTemplate] = useState<ArtworkTemplate>(defaultArtworkTemplate);
  const [submit, setSubmit] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function chooseImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP chapter image.");
      return;
    }
    if (file.size > 1_000_000) {
      setError("Chapter images must be smaller than 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => setError("We could not read that chapter image. Please try again.");
    reader.readAsDataURL(file);
  }

  async function saveChapter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch(`/api/works/${workId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, imageUrl, imageColor, imageTemplate, submit }),
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
      <div className="rounded-2xl border border-[#30384e] bg-[#171b26] p-5">
        <p className="text-sm font-semibold text-[#e8ecf4]">Chapter artwork <span className="font-normal text-[#6f7890]">(optional)</span></p>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row">
          <div className={`relative flex h-32 w-full shrink-0 items-end overflow-hidden rounded-xl bg-gradient-to-br ${getArtworkTemplateClass(imageTemplate)} p-4 sm:w-52`} style={{ backgroundColor: imageColor }}>
            {imageUrl && <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />}
            <span className="relative z-10 line-clamp-2 font-sinhala text-base font-bold text-[#f4ead8]">{title || "Chapter image"}</span>
          </div>
          <div className="space-y-4">
            <label htmlFor="chapter-image" className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-[#c8a96e]/50 px-4 text-sm font-semibold text-[#c8a96e] hover:bg-[#c8a96e]/10">
              Upload chapter image
              <input id="chapter-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} className="sr-only" />
            </label>
            <p className="text-xs leading-5 text-[#6f7890]">JPG, PNG, or WebP. Maximum 1 MB. A template or color is used when no image is uploaded.</p>
            <div className="flex flex-wrap gap-2">
              {artworkTemplates.map((template) => (
                <button key={template.value} type="button" onClick={() => setImageTemplate(template.value)} className={`min-h-11 rounded-lg border px-3 text-xs ${imageTemplate === template.value ? "border-[#c8a96e] text-[#c8a96e]" : "border-[#30384e] text-[#9ba5c0]"}`}>{template.label}</button>
              ))}
            </div>
            <label className="flex items-center gap-3 text-xs text-[#9ba5c0]">Fallback color
              <input type="color" value={imageColor} onChange={(event) => setImageColor(event.target.value)} className="h-10 w-14 cursor-pointer rounded border border-[#30384e] bg-transparent" />
            </label>
          </div>
        </div>
      </div>
      {error && <p role="alert" className="rounded-lg border border-[#f87171]/30 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" onClick={() => setSubmit(false)} disabled={saving} className="min-h-12 rounded-lg border border-[#30384e] px-5 text-sm text-[#c8a96e] disabled:opacity-60">Save draft</button>
        <button type="submit" onClick={() => setSubmit(true)} disabled={saving} className="min-h-12 rounded-lg bg-[#c8a96e] px-5 font-semibold text-[#0f1117] disabled:opacity-60">{saving ? "Saving..." : "Submit chapter"}</button>
      </div>
    </form>
  );
}
