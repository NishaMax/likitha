import Link from "next/link";
import { Suspense } from "react";
import AuthEntry from "@/components/auth/AuthEntry";
import Brand from "@/components/navigation/Brand";

export default function AuthEntryPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Brand />
        <Link href="/" className="flex min-h-11 items-center rounded-full px-3 text-sm text-[#9ba5c0] hover:text-[#e8ecf4]">← Home</Link>
      </header>
      <Suspense fallback={<div className="min-h-96" />}>
        <AuthEntry />
      </Suspense>
    </main>
  );
}
