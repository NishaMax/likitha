import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ProfileNameForm from "./ProfileNameForm";

export default async function OnboardingContent() {
  const session = await auth();
  if (!session?.user) redirect("/auth?mode=login");

  return (
    <section className="mx-auto flex max-w-6xl justify-center px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
      <div className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">One last step</p>
        <h1 className="mt-5 font-serif text-4xl tracking-tight text-[#e8ecf4]">Choose your public name.</h1>
        <p className="mt-4 font-sinhala text-base leading-8 text-[#9ba5c0]">ඔබේ සැබෑ නම හෝ ඔබ කැමති පෑන් නාමයක් භාවිතා කරන්න.</p>
        <div className="mt-8"><ProfileNameForm onboarding /></div>
      </div>
    </section>
  );
}
