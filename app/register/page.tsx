import Link from "next/link";
import { Suspense } from "react";
import AuthPage from "@/components/auth/AuthPage";

export default function RegisterPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="font-serif text-2xl tracking-tight text-[#e8ecf4]" aria-label="Likitha home">
          likitha<span className="text-[#c8a96e]">.</span>
        </Link>
        <Link href="/auth?mode=register" className="flex min-h-11 items-center rounded-full px-3 text-sm text-[#9ba5c0] hover:text-[#e8ecf4]">Change type</Link>
      </header>
      <Suspense fallback={<div className="min-h-96" />}><AuthPage mode="register" /></Suspense>
    </main>
  );
}
