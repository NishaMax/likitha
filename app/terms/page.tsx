import Link from "next/link";

export const metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
      <Link href="/" className="text-sm text-[#E4BD70] hover:text-[#EFD18D]">← Back to Likitha</Link>
      <p className="mt-12 text-xs font-semibold uppercase tracking-[.18em] text-[#E4BD70]">Legal</p>
      <h1 className="mt-4 font-serif text-4xl text-[#F6F0E6]">Terms of use</h1>
      <p className="mt-4 text-sm text-[#858A99]">Last updated: November 2026</p>
      <div className="mt-10 space-y-8 text-sm leading-8 text-[#B9BBC8]">
        <section><h2 className="font-serif text-2xl text-[#F6F0E6]">Use of Likitha</h2><p className="mt-3">Likitha is a platform for reading and sharing original Sinhala stories, poetry, and songs. You must provide accurate account information and keep your credentials private.</p></section>
        <section><h2 className="font-serif text-2xl text-[#F6F0E6]">Content and moderation</h2><p className="mt-3">Writers retain responsibility for their submissions. Content is reviewed before publication, and Likitha may reject, hide, or remove content that violates community standards or applicable law.</p></section>
        <section><h2 className="font-serif text-2xl text-[#F6F0E6]">Respectful community</h2><p className="mt-3">Do not harass others, upload material you do not have the right to share, or attempt to misuse accounts, moderation tools, or the service.</p></section>
      </div>
    </main>
  );
}
