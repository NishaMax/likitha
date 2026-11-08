import Link from "next/link";

export default function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-3" aria-label="Likitha home">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E4BD70]/60 font-sinhala text-lg font-bold text-[#E4BD70]">
        ලි
      </span>
      <span className="leading-none">
        <span className="block font-serif text-xl tracking-tight text-[#F6F0E6]">likitha<span className="text-[#E4BD70]">.</span></span>
        <span className="mt-1 block font-sinhala text-[9px] text-[#858A99]">ලියන්න · කියවන්න</span>
      </span>
    </Link>
  );
}
