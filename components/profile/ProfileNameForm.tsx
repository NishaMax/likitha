"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProfileNameFormProps = {
  initialName?: string;
  onboarding?: boolean;
};

export default function ProfileNameForm({ initialName = "", onboarding = false }: ProfileNameFormProps) {
  const [displayName, setDisplayName] = useState(initialName);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function saveName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });

    if (!response.ok) {
      const body = await response.json() as { error?: string };
      setError(body.error ?? "Unable to save your name.");
      setSaving(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={saveName} className="w-full max-w-md">
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
      <button type="submit" disabled={saving} className="mt-6 flex min-h-12 w-full items-center justify-center rounded-lg bg-[#c8a96e] px-6 font-semibold text-[#0f1117] transition hover:bg-[#d9ba7d] disabled:opacity-60">
        {saving ? "Saving..." : onboarding ? "Continue to Likitha →" : "Save display name"}
      </button>
    </form>
  );
}
