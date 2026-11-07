import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";

type DashboardNavProps = {
  role: "READER" | "WRITER" | "ADMIN";
};

const linksByRole = {
  READER: [
    { href: "/dashboard", label: "Home" },
    { href: "/browse", label: "Browse" },
    { href: "/profile", label: "Profile" },
  ],
  WRITER: [
    { href: "/dashboard", label: "Home" },
    { href: "/browse", label: "Read stories" },
    { href: "/dashboard/works", label: "My works" },
    { href: "/settings/profile", label: "Profile" },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Home" },
    { href: "/browse", label: "Read stories" },
    { href: "/settings/profile", label: "Profile" },
  ],
} as const;

export default function DashboardNav({ role }: DashboardNavProps) {
  const links = linksByRole[role];

  return (
    <header className="border-b border-[#202638] bg-[#0f1117]/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link href="/dashboard" className="shrink-0 font-serif text-2xl tracking-tight text-[#e8ecf4]" aria-label="Likitha dashboard">
          likitha<span className="text-[#c8a96e]">.</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Dashboard navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="flex min-h-11 items-center rounded-lg px-3 text-sm text-[#9ba5c0] transition hover:bg-[#171b26] hover:text-[#e8ecf4]">
              {link.label}
            </Link>
          ))}
          {role === "WRITER" && (
            <span className="ml-2 rounded-full border border-[#c8a96e]/30 bg-[#c8a96e]/[.07] px-3 py-2 text-xs font-semibold text-[#c8a96e]">
              Writer space
            </span>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/settings/profile" className="hidden min-h-11 items-center rounded-lg px-3 text-sm text-[#9ba5c0] transition hover:text-[#e8ecf4] sm:flex">
            Settings
          </Link>
          <SignOutButton />
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-3 md:hidden sm:px-8" aria-label="Mobile dashboard navigation">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="flex min-h-11 shrink-0 items-center rounded-lg bg-[#171b26] px-4 text-sm text-[#c4cada]">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
