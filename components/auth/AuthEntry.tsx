"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthEntry() {
  const searchParams = useSearchParams();
  const action = searchParams.get("mode") === "login" ? "Log in" : "Create an account";

  return (
    <section className="mx-auto max-w-3xl px-5 pb-20 pt-10 text-center sm:px-8 sm:pt-20">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Your place in the story</p>
      <h1 className="mt-5 font-serif text-4xl tracking-tight text-[#e8ecf4] sm:text-5xl">{action} as...</h1>
      <p className="mx-auto mt-4 max-w-lg font-sinhala text-base leading-8 text-[#9ba5c0]">ඔබට ගැළපෙන පැත්ත තෝරන්න. පසුව ඔබේ ගිණුම එකම භූමිකාවකට බැඳී පවතී.</p>
      <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
        <Link href={`/${action === "Log in" ? "login" : "register"}?role=reader`} className="group rounded-2xl border border-[#30384e] bg-[#171b26] p-6 transition hover:-translate-y-1 hover:border-[#c8a96e]/60">
          <span className="text-3xl">📖</span>
          <h2 className="mt-8 font-serif text-2xl text-[#e8ecf4]">Reader</h2>
          <p className="mt-2 text-sm leading-7 text-[#9ba5c0]">Discover stories, follow writers, and find your next favourite read.</p>
          <span className="mt-6 block text-sm font-semibold text-[#c8a96e]">Continue as reader →</span>
        </Link>
        <Link href={`/${action === "Log in" ? "login" : "register"}?role=writer`} className="group rounded-2xl border border-[#c8a96e]/40 bg-[#1b1b25] p-6 transition hover:-translate-y-1 hover:border-[#c8a96e]">
          <span className="text-3xl">✍️</span>
          <h2 className="mt-8 font-serif text-2xl text-[#e8ecf4]">Writer</h2>
          <p className="mt-2 text-sm leading-7 text-[#9ba5c0]">Write, publish, and build a readership for your Sinhala stories.</p>
          <span className="mt-6 block text-sm font-semibold text-[#c8a96e]">Continue as writer →</span>
        </Link>
      </div>
      <p className="mt-8 text-xs text-[#6f7890]">One email address can have one account type: Reader or Writer.</p>
    </section>
  );
}
