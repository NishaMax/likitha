"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionUser = {
  role?: "READER" | "WRITER" | "ADMIN";
  name?: string | null;
};

export default function PublicNav() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.json() as Promise<{ user?: SessionUser }>)
      .then((session) => {
        if (active) setUser(session.user ?? null);
      })
      .catch(() => {
        if (active) setUser(null);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="border-b border-[#202638] bg-[#0f1117]/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="shrink-0 font-serif text-2xl tracking-tight text-[#e8ecf4]" aria-label="Likitha home">
          likitha<span className="text-[#c8a96e]">.</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Public navigation">
          <Link href="/browse" className="hidden min-h-11 items-center rounded-lg px-3 text-sm text-[#9ba5c0] transition hover:bg-[#171b26] hover:text-[#e8ecf4] sm:flex">
            Browse stories
          </Link>
          {user?.role === "WRITER" && (
            <Link href="/dashboard" className="flex min-h-11 items-center rounded-lg border border-[#c8a96e]/40 px-3 text-sm text-[#c8a96e] transition hover:bg-[#c8a96e]/10">
              Writer dashboard
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/dashboard" className="flex min-h-11 items-center rounded-lg border border-[#c8a96e]/40 px-3 text-sm text-[#c8a96e] transition hover:bg-[#c8a96e]/10">
              Dashboard
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
