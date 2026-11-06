import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileNameForm from "./ProfileNameForm";

export default async function ProfileSettingsContent() {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth?mode=login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() }, select: { displayName: true } });
  if (!user) redirect("/auth?mode=login");

  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-20">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Profile settings</p>
      <h1 className="mt-5 font-serif text-4xl text-[#e8ecf4]">Your public name.</h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-[#9ba5c0]">You can use your real name, a pen name, or a fantasy name. This change only affects your public Likitha profile.</p>
      <div className="mt-8"><ProfileNameForm initialName={user.displayName} /></div>
    </section>
  );
}
