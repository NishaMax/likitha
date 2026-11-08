import Link from "next/link";
import Brand from "./Brand";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#252A39] bg-[#070A11]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <Brand />
          <p className="mt-5 max-w-sm font-sinhala text-sm leading-7 text-[#858A99]">
            සිංහල කතා, කවි සහ ගීත සඳහා ශ්‍රී ලංකාවේ නිර්මාණශීලී අවකාශය.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#E4BD70]">Explore</p>
          <div className="mt-4 grid gap-3 text-sm text-[#B9BBC8]">
            <Link href="/browse" className="hover:text-[#EFD18D]">Browse stories</Link>
            <Link href="/auth?mode=register" className="hover:text-[#EFD18D]">Start writing</Link>
            <Link href="/auth?mode=login" className="hover:text-[#EFD18D]">Log in</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#E4BD70]">Likitha</p>
          <div className="mt-4 grid gap-3 text-sm text-[#B9BBC8]">
            <Link href="/privacy" className="hover:text-[#EFD18D]">Privacy policy</Link>
            <Link href="/terms" className="hover:text-[#EFD18D]">Terms of use</Link>
            <Link href="/browse#genres" className="hover:text-[#EFD18D]">Genres</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[#252A39]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-[#858A99] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span>© 2026 Likitha. All rights reserved.</span>
          <span>Write. Share. Discover.</span>
        </div>
      </div>
    </footer>
  );
}
