"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Brand from "@/components/navigation/Brand";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        role: "ADMIN",
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        setError("The admin email or password is incorrect.");
        setSaving(false);
        return;
      }

      window.location.href = "/admin/reviews";
    } catch {
      setError("Unable to sign in. Please try again.");
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-[#30384e] bg-[#171b26] p-6 sm:p-8">
        <Brand />
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Likitha administration</p>
        <h1 className="mt-4 font-serif text-4xl text-[#e8ecf4]">Admin sign in.</h1>
        <p className="mt-3 text-sm leading-7 text-[#9ba5c0]">This area is restricted to the configured administrator.</p>
        <div className="mt-8 space-y-4">
          <label className="block text-sm text-[#c4cada]">Admin email
            <input name="email" type="email" required autoComplete="username" className="mt-2 min-h-12 w-full rounded-lg border border-[#30384e] bg-[#12151e] px-4 text-sm text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
          </label>
          <label className="block text-sm text-[#c4cada]">Password
            <input name="password" type="password" required autoComplete="current-password" className="mt-2 min-h-12 w-full rounded-lg border border-[#30384e] bg-[#12151e] px-4 text-sm text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
          </label>
        </div>
        {error && <p role="alert" className="mt-5 rounded-lg border border-[#f87171]/30 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>}
        <button type="submit" disabled={saving} className="mt-6 flex min-h-12 w-full items-center justify-center rounded-lg bg-[#c8a96e] px-6 font-semibold text-[#0f1117] disabled:opacity-60">
          {saving ? "Signing in..." : "Sign in to admin"}
        </button>
      </form>
    </main>
  );
}
