import Link from "next/link";

export const metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
      <Link href="/" className="text-sm text-[#E4BD70] hover:text-[#EFD18D]">← Back to Likitha</Link>
      <p className="mt-12 text-xs font-semibold uppercase tracking-[.18em] text-[#E4BD70]">Legal</p>
      <h1 className="mt-4 font-serif text-4xl text-[#F6F0E6]">Privacy policy</h1>
      <p className="mt-4 text-sm text-[#858A99]">Last updated: November 2026</p>
      <div className="mt-10 space-y-8 text-sm leading-8 text-[#B9BBC8]">
        <section><h2 className="font-serif text-2xl text-[#F6F0E6]">Information we collect</h2><p className="mt-3">Likitha collects account details, public profile information, published work, reading progress, and engagement activity needed to operate the service.</p></section>
        <section><h2 className="font-serif text-2xl text-[#F6F0E6]">How we use it</h2><p className="mt-3">We use this information to authenticate accounts, show public profiles and approved work, provide reading features, moderate the community, and improve Likitha.</p></section>
        <section><h2 className="font-serif text-2xl text-[#F6F0E6]">Your choices</h2><p className="mt-3">You may update your public profile information. Contact the Likitha team to request account or content changes, subject to moderation and legal requirements.</p></section>
      </div>
    </main>
  );
}
