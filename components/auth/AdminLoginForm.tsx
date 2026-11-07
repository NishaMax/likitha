"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      role: "ADMIN",
      redirect: false,
    });
    if (result?.error) {
      setError("Admin email or password is incorrect.");
      setBusy(false);
      return;
    }
    router.push("/admin/reviews");
  }

  return (
    <form onSubmit={submit} className="mt-8 w-full max-w-md space-y-4">
      <div>
        <label htmlFor="admin-email" className="mb-2 block text-sm text-[#c4cada]">Admin email</label>
        <input id="admin-email" name="email" type="email" autoComplete="email" required className="min-h-12 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 text-sm text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-2 block text-sm text-[#c4cada]">Password</label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required className="min-h-12 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 text-sm text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
      </div>
      {error && <p role="alert" className="rounded-lg border border-[#f87171]/30 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>}
      <button type="submit" disabled={busy} className="min-h-12 w-full rounded-lg bg-[#c8a96e] px-6 font-semibold text-[#0f1117] disabled:opacity-60">{busy ? "Signing in..." : "Sign in to admin"}</button>
    </form>
  );
}
