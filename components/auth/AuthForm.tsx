"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

type Role = "reader" | "writer";

type AuthFormProps = {
  mode: "login" | "register";
  role: Role;
};

const roleCopy = {
  reader: {
    label: "Reader",
    sinhala: "කියවන්න",
    description: "Discover stories and follow the writers you love.",
  },
  writer: {
    label: "Writer",
    sinhala: "ලියන්න",
    description: "Share your stories with readers across Sri Lanka.",
  },
} as const;

export default function AuthForm({ mode, role }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const copy = roleCopy[role];
  const otherRole = role === "reader" ? "writer" : "reader";
  const action = mode === "login" ? "Log in" : "Create account";

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <span className="rounded-full border border-[#c8a96e]/30 bg-[#c8a96e]/[.07] px-3 py-2 text-xs font-semibold uppercase tracking-[.15em] text-[#c8a96e]">
          {copy.label} · {copy.sinhala}
        </span>
        <h1 className="mt-6 font-serif text-4xl tracking-tight text-[#e8ecf4]">
          {mode === "login" ? "Welcome back." : "Your story starts here."}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#9ba5c0]">{copy.description}</p>
      </div>

      <button type="button" onClick={() => {
        document.cookie = `likitha_auth_role=${role.toUpperCase()}; path=/; max-age=600; samesite=lax`;
        void signIn("google", { callbackUrl: role === "writer" ? "/dashboard" : "/browse" });
      }} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#30384e] bg-[#171b26] text-sm font-medium text-[#e8ecf4] transition hover:border-[#c8a96e]/60">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285f4]">G</span>
        Continue with Google
      </button>

      <div className="my-7 flex items-center gap-4 text-xs text-[#6f7890]">
        <span className="h-px flex-1 bg-[#252d40]" />
        or use your email
        <span className="h-px flex-1 bg-[#252d40]" />
      </div>

      <form className="space-y-4" onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");

        if (mode === "register") {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              displayName: String(formData.get("name") ?? ""),
              email,
              password,
              role: role.toUpperCase(),
            }),
          });
          if (!response.ok) {
            const body = await response.json() as { error?: string };
            setError(body.error ?? "Unable to create your account.");
            setIsSubmitting(false);
            return;
          }
        }

        const result = await signIn("credentials", {
          email,
          password,
          role: role.toUpperCase(),
          redirect: false,
        });
        if (result?.error) {
          setError(mode === "register" ? "Account created, but login failed. Please try logging in." : "Email, password, or account type is incorrect.");
          setIsSubmitting(false);
          return;
        }
        window.location.href = role === "writer" ? "/dashboard" : "/browse";
      }} >
        {mode === "register" && (
          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-[#c4cada]">Display name</label>
            <input id="name" name="name" type="text" autoComplete="name" className="min-h-12 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 text-sm text-[#e8ecf4] outline-none transition focus:border-[#c8a96e]" placeholder="Your name" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-[#c4cada]">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="min-h-12 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 text-sm text-[#e8ecf4] outline-none transition focus:border-[#c8a96e]" placeholder="you@example.com" />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="text-sm text-[#c4cada]">Password</label>
            {mode === "login" && <Link href={`/forgot-password?role=${role}`} className="text-xs text-[#c8a96e] hover:underline">Forgot password?</Link>}
          </div>
          <div className="relative">
            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required className="min-h-12 w-full rounded-lg border border-[#30384e] bg-[#171b26] px-4 pr-16 text-sm text-[#e8ecf4] outline-none transition focus:border-[#c8a96e]" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 min-h-10 -translate-y-1/2 rounded-md px-2 text-xs text-[#9ba5c0] hover:text-[#e8ecf4]">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        {error && <p role="alert" className="rounded-lg border border-[#f87171]/30 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="mt-2 flex min-h-12 w-full items-center justify-center rounded-lg bg-[#c8a96e] px-6 font-semibold text-[#0f1117] transition hover:bg-[#d9ba7d] disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "Please wait..." : `${action} as ${copy.label}`} {!isSubmitting && <span className="ml-2 text-lg">→</span>}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-[#6f7890]">
        {mode === "login" ? "New to Likitha?" : "Already have an account?"}{" "}
        <Link href={`/${mode === "login" ? "register" : "login"}?role=${role}`} className="text-[#c8a96e] hover:underline">
          {mode === "login" ? "Create an account" : "Log in"}
        </Link>
      </p>
      <p className="mt-5 text-center text-xs text-[#6f7890]">
        {mode === "login" ? "Want a different account type?" : "Choosing a different account type?"}{" "}
        <Link href={`/auth?mode=${mode}`} className="text-[#9ba5c0] hover:text-[#e8ecf4]">
          Switch to {roleCopy[otherRole].label}
        </Link>
      </p>
    </div>
  );
}
