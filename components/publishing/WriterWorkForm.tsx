"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { artworkTemplates, defaultArtworkTemplate, getArtworkTemplateClass, type ArtworkTemplate } from "@/lib/artwork";

const types = [
  { value: "STORY", label: "Story", sinhala: "කතාව" },
  { value: "POETRY", label: "Poetry", sinhala: "පද්‍ය / කවි" },
  { value: "SONG", label: "Song", sinhala: "ගීත පද" },
] as const;

export type InitialWorkData = {
  id: string;
  type: "STORY" | "POETRY" | "SONG";
  storyFormat?: "SINGLE" | "SERIAL";
  title: string;
  description: string;
  genre: string;
  content?: string | null;
  coverImageUrl?: string | null;
  coverColor?: string;
  coverTemplate?: string;
  status?: string;
  reviewNote?: string | null;
};

type WriterWorkFormProps = {
  initialWork?: InitialWorkData;
};

export default function WriterWorkForm({ initialWork }: WriterWorkFormProps) {
  const isEditing = Boolean(initialWork);
  const [type, setType] = useState<(typeof types)[number]["value"]>(initialWork?.type ?? "STORY");
  const [storyFormat, setStoryFormat] = useState<"SINGLE" | "SERIAL">(
    initialWork?.storyFormat ?? (initialWork?.content ? "SINGLE" : "SERIAL")
  );
  const [title, setTitle] = useState(initialWork?.title ?? "");
  const [description, setDescription] = useState(initialWork?.description ?? "");
  const [genre, setGenre] = useState(initialWork?.genre ?? "");
  const [content, setContent] = useState(initialWork?.content ?? "");
  const [chapter1Title, setChapter1Title] = useState("පරිච්ඡේදය 1");
  const [chapter1Content, setChapter1Content] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialWork?.coverImageUrl ?? null);
  const [coverColor, setCoverColor] = useState(initialWork?.coverColor ?? "#334c50");
  const [coverTemplate, setCoverTemplate] = useState<ArtworkTemplate>(
    (initialWork?.coverTemplate as ArtworkTemplate) ?? defaultArtworkTemplate
  );
  const [submit, setSubmit] = useState(false);
  const [coverError, setCoverError] = useState(""); // shown at eye level near the cover upload button
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  function chooseCover(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setCoverError("Choose a JPG, PNG, or WebP cover image.");
      return;
    }
    if (file.size > 2_500_000) {
      setCoverError("Cover image must be smaller than 2.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCoverImageUrl(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => setCoverError("We could not read that cover image. Please try again.");
    reader.readAsDataURL(file);
  }

  async function saveWork(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (type === "STORY") {
      if (storyFormat === "SINGLE" && submit && content.trim().length < 20) {
        setError("Single-chapter stories must have at least 20 characters before submitting for approval.");
        return;
      }
      if (storyFormat === "SERIAL" && !isEditing && submit && chapter1Content.trim().length < 20) {
        setError("Please write Chapter 1 (at least 20 characters) before submitting your story for approval.");
        return;
      }
    }

    setSaving(true);
    try {
      const url = isEditing ? `/api/works/${initialWork!.id}` : "/api/works";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          storyFormat,
          title,
          description,
          genre,
          content: content.trim() || null,
          chapter1Title: chapter1Title.trim() || undefined,
          chapter1Content: chapter1Content.trim() || undefined,
          coverImageUrl,
          coverColor,
          coverTemplate,
          submit,
        }),
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

  async function handleDelete() {
    if (!initialWork) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/works/${initialWork.id}`, { method: "DELETE" });
      if (!response.ok) {
        setError("Unable to delete this work.");
        setSaving(false);
        return;
      }
      window.location.href = "/dashboard/works";
    } catch {
      setError("Connection error. Try again.");
      setSaving(false);
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chapter1WordCount = chapter1Content.trim() ? chapter1Content.trim().split(/\s+/).length : 0;

  return (
    <form onSubmit={saveWork} className="max-w-2xl space-y-7">
      {initialWork?.status === "REJECTED" && initialWork.reviewNote && (
        <div className="rounded-xl border border-[#f87171]/40 bg-[#f87171]/10 p-4 text-sm text-[#fca5a5]">
          <p className="font-semibold text-[#f87171]">Administrator feedback:</p>
          <p className="mt-1 leading-6">{initialWork.reviewNote}</p>
        </div>
      )}

      {!isEditing && (
        <div>
          <p className="mb-3 text-sm text-[#c4cada]">What are you publishing?</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {types.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setType(item.value)}
                className={`flex min-h-14 flex-col items-center justify-center rounded-xl border px-4 py-2 text-center transition ${
                  type === item.value
                    ? "border-[#c8a96e] bg-[#c8a96e] text-[#0f1117]"
                    : "border-[#30384e] bg-[#171b26] text-[#9ba5c0] hover:border-[#c8a96e]/50 hover:text-[#e8ecf4]"
                }`}
              >
                <span className="text-sm font-semibold">{item.label}</span>
                <span className={`text-xs ${type === item.value ? "text-[#2e2617]" : "text-[#6f7890]"}`}>{item.sinhala}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Story format selection */}
      {type === "STORY" && (
        <div className="rounded-2xl border border-[#30384e] bg-[#171b26] p-5">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Story format</p>
          <p className="mt-1 text-sm text-[#e8ecf4]">Choose how your story will be published:</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setStoryFormat("SINGLE")}
              className={`rounded-xl border p-4 text-left transition ${
                storyFormat === "SINGLE"
                  ? "border-[#c8a96e] bg-[#c8a96e]/10 text-[#e8ecf4]"
                  : "border-[#30384e] bg-[#12151e] text-[#9ba5c0] hover:border-[#c8a96e]/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-[#e8ecf4]">Single chapter (One-shot)</span>
                {storyFormat === "SINGLE" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c8a96e] text-xs font-bold text-[#0f1117]">✓</span>
                )}
              </div>
              <p className="mt-1.5 font-sinhala text-xs leading-5 text-[#c8a96e]">තනි පරිච්ඡේදයකින් අවසන් වන කතාවක්</p>
              <p className="mt-2 text-xs leading-5 text-[#858a99]">A standalone complete story in 1 chapter. You can write the whole story right here.</p>
            </button>

            <button
              type="button"
              onClick={() => setStoryFormat("SERIAL")}
              className={`rounded-xl border p-4 text-left transition ${
                storyFormat === "SERIAL"
                  ? "border-[#c8a96e] bg-[#c8a96e]/10 text-[#e8ecf4]"
                  : "border-[#30384e] bg-[#12151e] text-[#9ba5c0] hover:border-[#c8a96e]/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-[#e8ecf4]">Chapters story (Series)</span>
                {storyFormat === "SERIAL" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c8a96e] text-xs font-bold text-[#0f1117]">✓</span>
                )}
              </div>
              <p className="mt-1.5 font-sinhala text-xs leading-5 text-[#c8a96e]">පරිච්ඡේද කිහිපයකින් යුත් කතාවක්</p>
              <p className="mt-2 text-xs leading-5 text-[#858a99]">An episodic story published chapter by chapter. You can write Chapter 1 now and add more later.</p>
            </button>
          </div>
        </div>
      )}

      <label className="block text-sm text-[#c4cada]">
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          minLength={2}
          maxLength={120}
          required
          placeholder="Story title / කතාවේ නම"
          className="mt-2 min-h-12 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 font-sinhala text-[#e8ecf4] outline-none focus:border-[#c8a96e]"
        />
      </label>

      <label className="block text-sm text-[#c4cada]">
        Genre
        <input
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
          maxLength={40}
          required
          placeholder="Romance, mystery, drama, fantasy / ප්‍රේම, අභිරහස්, ත්‍රාසජනක..."
          className="mt-2 min-h-12 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 font-sinhala text-[#e8ecf4] outline-none focus:border-[#c8a96e]"
        />
      </label>

      <label className="block text-sm text-[#c4cada]">
        Synopsis / Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          minLength={10}
          maxLength={1000}
          required
          rows={4}
          placeholder="A captivating summary to introduce your work to readers..."
          className="mt-2 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 py-3 font-sinhala leading-7 text-[#e8ecf4] outline-none focus:border-[#c8a96e]"
        />
      </label>

      {/* Story artwork */}
      <div className="rounded-2xl border border-[#30384e] bg-[#171b26] p-5">
        <p className="text-sm font-semibold text-[#e8ecf4]">
          Story artwork <span className="font-normal text-[#6f7890]">(optional)</span>
        </p>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row">
          <div
            className={`relative flex h-48 w-full shrink-0 items-end overflow-hidden rounded-xl bg-gradient-to-br ${getArtworkTemplateClass(
              coverTemplate
            )} p-4 sm:w-36`}
            style={{ backgroundColor: coverColor }}
          >
            {coverImageUrl && <Image src={coverImageUrl} alt="" fill className="object-cover" unoptimized />}
            <span className="relative z-10 line-clamp-2 font-sinhala text-lg font-bold text-[#f4ead8]">
              {title || "Your cover"}
            </span>
          </div>
          <div className="space-y-4">
            <label
              htmlFor="cover-image"
              className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-[#c8a96e]/50 px-4 text-sm font-semibold text-[#c8a96e] hover:bg-[#c8a96e]/10"
            >
              Upload cover image
              <input id="cover-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseCover} className="sr-only" />
            </label>
            <p className="text-xs leading-5 text-[#6f7890]">JPG, PNG, or WebP. Maximum 2.5 MB. If you skip it, choose a template and color.</p>
            {/* Cover image error shown immediately at eye level, below the button */}
            {coverError && (
              <p role="alert" className="rounded-lg border border-[#f87171]/30 bg-[#f87171]/10 px-3 py-2 text-xs text-[#fca5a5]">{coverError}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {artworkTemplates.map((template) => (
                <button
                  key={template.value}
                  type="button"
                  onClick={() => setCoverTemplate(template.value)}
                  className={`min-h-11 rounded-lg border px-3 text-xs ${
                    coverTemplate === template.value ? "border-[#c8a96e] text-[#c8a96e]" : "border-[#30384e] text-[#9ba5c0]"
                  }`}
                >
                  {template.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 text-xs text-[#9ba5c0]">
              Fallback color
              <input
                type="color"
                value={coverColor}
                onChange={(event) => setCoverColor(event.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-[#30384e] bg-transparent"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Story content for Single-chapter story OR Poetry/Song content */}
      {(type !== "STORY" || storyFormat === "SINGLE") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm text-[#c4cada]">
              {type === "STORY" ? "Story content (තනි පරිච්ඡේදය)" : type === "POETRY" ? "Poem (කවිය)" : "Lyrics (ගී පද)"}
            </label>
            <span className="text-xs text-[#6f7890]">{wordCount} words · {content.length} characters</span>
          </div>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={100000}
            rows={14}
            placeholder={
              type === "STORY"
                ? "Write your complete story here in Sinhala... ඔබේ සම්පූර්ණ කතාව මෙතැන ලියන්න..."
                : "Write your Sinhala content here... ඔබේ නිර්මාණය මෙතැන ලියන්න..."
            }
            className="w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 py-3 font-sinhala text-base leading-8 text-[#e8ecf4] outline-none focus:border-[#c8a96e]"
          />
        </div>
      )}

      {/* Multi-chapter series: Chapter 1 writing section on initial creation */}
      {type === "STORY" && storyFormat === "SERIAL" && !isEditing && (
        <div className="rounded-2xl border border-[#30384e] bg-[#171b26] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#252d40] pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Initial chapter</p>
              <h3 className="mt-1 font-serif text-lg text-[#e8ecf4]">Include Chapter 1 in this submission</h3>
            </div>
            <span className="text-xs text-[#9ba5c0]">Chapter 2, 3 can be added later</span>
          </div>

          <label className="block text-sm text-[#c4cada]">
            Chapter 1 title
            <input
              value={chapter1Title}
              onChange={(event) => setChapter1Title(event.target.value)}
              maxLength={120}
              placeholder="e.g. Chapter 1 / පරිච්ඡේදය 1"
              className="mt-2 min-h-12 w-full rounded-lg border border-[#30384e] bg-[#12151e] px-4 font-sinhala text-sm text-[#e8ecf4] outline-none focus:border-[#c8a96e]"
            />
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-[#c4cada]">Chapter 1 content</label>
              <span className="text-xs text-[#6f7890]">{chapter1WordCount} words</span>
            </div>
            <textarea
              value={chapter1Content}
              onChange={(event) => setChapter1Content(event.target.value)}
              rows={12}
              placeholder="Write Chapter 1 in Sinhala here... 1 වන පරිච්ඡේදයේ අන්තර්ගතය මෙතැන ලියන්න..."
              className="w-full rounded-lg border border-[#30384e] bg-[#12151e] px-4 py-3 font-sinhala text-base leading-8 text-[#e8ecf4] outline-none focus:border-[#c8a96e]"
            />
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-[#f87171]/30 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            onClick={() => setSubmit(false)}
            disabled={saving}
            className="min-h-12 rounded-lg border border-[#30384e] px-6 text-sm font-medium text-[#c8a96e] transition hover:border-[#c8a96e]/60 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save draft"}
          </button>
          <button
            type="submit"
            onClick={() => setSubmit(true)}
            disabled={saving}
            className="min-h-12 rounded-lg bg-[#c8a96e] px-6 text-sm font-semibold text-[#0f1117] transition hover:bg-[#d9ba7d] disabled:opacity-60"
          >
            {saving ? "Submitting..." : isEditing && initialWork?.status === "REJECTED" ? "Resubmit for approval" : "Submit for approval"}
          </button>
        </div>

        {isEditing && (
          <div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
                className="text-xs text-[#f87171] hover:underline"
              >
                Delete this work
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-[#f87171]/40 bg-[#1f1618] px-3 py-2 text-xs">
                <span className="text-[#fca5a5]">Are you sure?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="font-bold text-[#f87171] hover:underline"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={saving}
                  className="text-[#9ba5c0] hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
