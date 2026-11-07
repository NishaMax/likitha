"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ProfileNameFormProps = {
  initialName?: string;
  initialAvatarUrl?: string | null;
  onboarding?: boolean;
};

const maxAvatarBytes = 1_000_000;

export default function ProfileNameForm({ initialName = "", initialAvatarUrl = null, onboarding = false }: ProfileNameFormProps) {
  const [displayName, setDisplayName] = useState(initialName);
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
      setError("Profile images must be smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => setError("We could not read that image. Please try again.");
    reader.readAsDataURL(file);
  }

  async function saveName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, avatarUrl }),
      });

      if (!response.ok) {
        const body = await response.json() as { error?: string };
        setError(body.error ?? "Unable to save your name.");
        return;
      }

      setSaved(true);
      if (onboarding) router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to reach Likitha. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={saveName} className="w-full max-w-md space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-[#30384e] bg-[#171b26] p-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#c8a96e]/40 bg-[#12151e] text-3xl font-serif text-[#c8a96e]">
          {avatarUrl ? <Image src={avatarUrl} alt="" width={80} height={80} className="h-full w-full object-cover" unoptimized /> : displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <label htmlFor="reader-avatar" className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-[#c8a96e]/50 px-4 text-sm font-semibold text-[#c8a96e] hover:bg-[#c8a96e]/10">
            Upload profile picture
            <input id="reader-avatar" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseAvatar} className="sr-only" />
          </label>
          <p className="mt-2 text-xs leading-5 text-[#6f7890]">JPG, PNG, WebP, or GIF. Maximum 1 MB.</p>
        </div>
      </div>
      <label htmlFor="displayName" className="mb-2 block text-sm text-[#c4cada]">Public display name</label>
      <input
        id="displayName"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        minLength={2}
        maxLength={60}
        required
        className="min-h-12 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 text-sm text-[#e8ecf4] outline-none transition focus:border-[#c8a96e]"
        placeholder="Your pen name or display name"
      />
      <p className="mt-3 text-xs leading-6 text-[#6f7890]">
        This is the name readers will see. You can change it later from your profile settings.
      </p>
      {error && <p role="alert" className="mt-4 rounded-lg border border-[#f87171]/30 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>}
      {saved && <p role="status" className="rounded-lg border border-[#86efac]/30 bg-[#86efac]/10 px-4 py-3 text-sm text-[#bbf7d0]">Your profile has been saved.</p>}
      <button type="submit" disabled={saving} className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#c8a96e] px-6 font-semibold text-[#0f1117] transition hover:bg-[#d9ba7d] disabled:opacity-60">
        {saving ? "Saving..." : onboarding ? "Continue to Likitha →" : "Save display name"}
      </button>
    </form>
  );
}
