import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import WriterWorkForm from "@/components/publishing/WriterWorkForm";

export default function NewWorkPage() {
  return <Suspense fallback={<main className="min-h-screen" />}><NewWorkContent /></Suspense>;
}

async function NewWorkContent() {
  const session = await auth();
  if (!session?.user) redirect("/auth?mode=login");
  return <main className="min-h-screen"><DashboardNav role="WRITER" /><section className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Writer studio</p><h1 className="mt-4 font-serif text-4xl text-[#e8ecf4]">Create a new work.</h1><p className="mt-3 max-w-xl text-sm leading-7 text-[#9ba5c0]">Choose a format, save a draft, or submit it for admin approval.</p><div className="mt-8"><WriterWorkForm /></div></section></main>;
}
