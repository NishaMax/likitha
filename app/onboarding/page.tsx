import { Suspense } from "react";
import Link from "next/link";
import OnboardingContent from "@/components/profile/OnboardingContent";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="font-serif text-2xl tracking-tight text-[#e8ecf4]" aria-label="Likitha home">
          likitha<span className="text-[#c8a96e]">.</span>
        </Link>
      </header>
      <Suspense fallback={<div className="min-h-96" />}><OnboardingContent /></Suspense>
    </main>
  );
}
