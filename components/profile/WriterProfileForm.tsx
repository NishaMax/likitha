"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type WriterProfileFormProps = {
  initialName: string;
  initialBio: string;
  initialAvatarUrl: string | null;
};

const maxAvatarBytes = 1_000_000;

export default function WriterProfileForm({ initialName, initialBio, initialAvatarUrl }: WriterProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function chooseAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Choose a JPG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > maxAvatarBytes) {
      setError("Avatar images must be smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => setError("We could not read that image. Please try again.");
    reader.readAsDataURL(file);
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, avatarUrl }),
      });

      if (!response.ok) {
        const body = await response.json() as { error?: string };
        setError(body.error ?? "Unable to save your profile.");
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("Unable to reach Likitha. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={saveProfile} className="max-w-2xl space-y-8">
      <div className="flex flex-col gap-5 rounded-2xl border border-[#30384e] bg-[#171b26] p-5 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#c8a96e]/40 bg-[#12151e] text-3xl font-serif text-[#c8a96e]">
          {avatarUrl ? <Image src={avatarUrl} alt="" width={96} height={96} className="h-full w-full object-cover" unoptimized /> : displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <label htmlFor="avatar" className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-[#c8a96e]/50 px-4 text-sm font-semibold text-[#c8a96e] hover:bg-[#c8a96e]/10">
            Upload avatar
            <input id="avatar" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseAvatar} className="sr-only" />
          </label>
          <p className="mt-2 text-xs leading-5 text-[#6f7890]">JPG, PNG, WebP, or GIF. Maximum 1 MB.</p>
        </div>
      </div>

      <div>
        <label htmlFor="displayName" className="mb-2 block text-sm text-[#c4cada]">Public writer name</label>
        <input id="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} minLength={2} maxLength={60} required className="min-h-12 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 text-sm text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
      </div>

      <div>
        <label htmlFor="bio" className="mb-2 block text-sm text-[#c4cada]">Short bio <span className="text-[#6f7890]">(optional)</span></label>
        <textarea id="bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={500} rows={5} placeholder="Tell readers a little about your writing..." className="w-full resize-y rounded-lg border border-[#30384e] bg-[#171b26] px-4 py-3 text-sm leading-7 text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
        <p className="mt-2 text-xs text-[#6f7890]">{bio.length}/500 characters</p>
      </div>

      {error && <p role="alert" className="rounded-lg border border-[#f87171]/30 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>}
      {saved && <p role="status" className="rounded-lg border border-[#86efac]/30 bg-[#86efac]/10 px-4 py-3 text-sm text-[#bbf7d0]">Your writer profile has been saved.</p>}
      <button type="submit" disabled={saving} className="min-h-12 rounded-lg bg-[#c8a96e] px-6 font-semibold text-[#0f1117] hover:bg-[#d9ba7d] disabled:opacity-60">
        {saving ? "Saving..." : "Save writer profile"}
      </button>
    </form>
  );
}
