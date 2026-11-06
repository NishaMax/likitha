import { Suspense } from "react";
import Link from "next/link";
import ProfileSettingsContent from "@/components/profile/ProfileSettingsContent";

export default function ProfileSettingsPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/dashboard" className="font-serif text-2xl tracking-tight text-[#e8ecf4]">likitha<span className="text-[#c8a96e]">.</span></Link>
        <Link href="/dashboard" className="text-sm text-[#9ba5c0] hover:text-[#e8ecf4]">← Dashboard</Link>
      </header>
      <Suspense fallback={<div className="min-h-96" />}><ProfileSettingsContent /></Suspense>
    </main>
  );
}
