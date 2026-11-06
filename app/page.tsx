import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="font-serif text-2xl tracking-tight text-[#e8ecf4]" aria-label="Likitha home">
          likitha<span className="text-[#c8a96e]">.</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm" aria-label="Primary navigation">
          <Link href="/browse" className="hidden min-h-11 items-center rounded-full px-4 text-[#9ba5c0] transition hover:text-[#e8ecf4] sm:flex">
            Discover
          </Link>
          <a href="#write" className="flex min-h-11 items-center rounded-full border border-[#c8a96e]/40 px-4 text-[#c8a96e] transition hover:bg-[#c8a96e]/10">
            Start writing
          </a>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16 lg:px-10 lg:pb-28 lg:pt-24">
        <div className="relative z-10">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c8a96e]/25 bg-[#c8a96e]/[.07] px-3 py-2 text-xs font-medium tracking-wide text-[#c8a96e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c8a96e]" />
            SRI LANKA&apos;S STORY SPACE
          </p>
          <h1 className="max-w-xl font-sinhala text-4xl font-bold leading-[1.35] tracking-tight text-[#e8ecf4] sm:text-5xl lg:text-6xl">
            ඔබේ කතාවට
            <br />
            <span className="text-[#c8a96e]">තැනක්.</span>
          </h1>
          <p className="mt-6 max-w-lg font-sinhala text-base leading-8 text-[#9ba5c0] sm:text-lg">
            සිංහල කතා කියවන්න, ලියන්න, බෙදාගන්න. ශ්‍රී ලංකාවේ නව පරපුරේ ලේඛකයන්ගේ හඬ එකම තැනක.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/browse" className="flex min-h-12 items-center justify-center rounded-lg bg-[#c8a96e] px-6 font-semibold text-[#0f1117] transition hover:bg-[#d9ba7d]">
              Explore stories <span className="ml-2 text-lg">→</span>
            </Link>
            <a href="#write" className="flex min-h-12 items-center justify-center rounded-lg border border-[#30384e] px-6 font-medium text-[#e8ecf4] transition hover:border-[#c8a96e]/60">
              Share your story
            </a>
          </div>
          <div className="mt-9 flex items-center gap-5 text-xs text-[#6f7890]">
            <span className="flex items-center gap-2"><span className="text-[#c8a96e]">✦</span> Free to read</span>
            <span className="h-1 w-1 rounded-full bg-[#4b5368]" />
            <span>Made for Sinhala</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#c8a96e]/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-20 h-56 w-56 rounded-full bg-[#6b4c32]/20 blur-3xl" />
          <div className="relative rounded-2xl border border-[#30384e] bg-[#171b26] p-4 shadow-2xl shadow-black/30 sm:p-5">
            <div className="flex items-center justify-between border-b border-[#30384e] pb-4">
              <span className="text-xs font-medium uppercase tracking-[.18em] text-[#9ba5c0]">Featured story</span>
              <span className="rounded-full bg-[#c8a96e]/15 px-3 py-1 text-[10px] font-semibold text-[#c8a96e]">NEW</span>
            </div>
            <div className="mt-5 flex min-h-64 items-end rounded-xl bg-gradient-to-br from-[#4d372d] via-[#302b39] to-[#171b26] p-5 sm:min-h-72">
              <div>
                <p className="mb-3 text-xs uppercase tracking-[.16em] text-[#c8a96e]">A short story</p>
                <h2 className="font-sinhala text-2xl font-bold leading-relaxed text-[#f4ead8]">අවසන් වැස්ස</h2>
                <p className="mt-1 text-sm text-[#b8a99a]">by දිනුෂා පෙරේරා</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 text-xs text-[#9ba5c0]">
              <span>Romance · 12 chapters</span>
              <span className="text-[#c8a96e]">Read now →</span>
            </div>
          </div>
        </div>
      </section>

      <section id="discover" className="border-t border-[#202638] bg-[#12151e]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Begin here</p>
              <h2 className="mt-3 font-serif text-3xl text-[#e8ecf4] sm:text-4xl">Stories worth staying for.</h2>
            </div>
            <Link href="/browse" className="hidden min-h-11 items-center text-sm text-[#9ba5c0] hover:text-[#c8a96e] sm:flex">View all <span className="ml-2">→</span></Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["01", "The stories everyone is reading", "Trending now"],
              ["02", "Fresh voices, new worlds", "New arrivals"],
              ["03", "Find your next favourite", "Browse genres"],
            ].map(([number, title, label]) => (
              <Link key={number} href="/browse" className="group rounded-xl border border-[#252d40] bg-[#171b26] p-5 transition hover:-translate-y-1 hover:border-[#c8a96e]/40">
                <span className="font-mono text-xs text-[#c8a96e]">{number}</span>
                <h3 className="mt-10 font-sinhala text-lg font-bold leading-8 text-[#e8ecf4]">{title}</h3>
                <p className="mt-2 text-sm text-[#6f7890]">{label} <span className="ml-1 transition group-hover:ml-2 group-hover:text-[#c8a96e]">→</span></p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer id="write" className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-xs text-[#6f7890] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <span className="font-serif text-base text-[#9ba5c0]">likitha<span className="text-[#c8a96e]">.</span></span>
        <span>Write. Share. Discover.</span>
      </footer>
    </main>
  );
}
