"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Brand from "./Brand";

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
    <header className="border-b border-[#252A39] bg-[#070A11]/90 backdrop-blur">
      <div className="mx-auto flex min-h-20 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Brand />
        <nav className="flex items-center gap-1" aria-label="Public navigation">
          <Link href="/browse" className="hidden min-h-11 items-center rounded-lg px-3 text-sm text-[#B9BBC8] transition hover:bg-[#111520] hover:text-[#F6F0E6] sm:flex">
            Discover
          </Link>
          {user?.role === "READER" && (
            <Link href="/profile" className="flex min-h-11 items-center rounded-lg px-3 text-sm text-[#9ba5c0] transition hover:bg-[#171b26] hover:text-[#e8ecf4]">
              Profile
            </Link>
          )}
          {user?.role === "WRITER" && (
            <Link href="/settings/profile" className="flex min-h-11 items-center rounded-lg px-3 text-sm text-[#9ba5c0] transition hover:bg-[#171b26] hover:text-[#e8ecf4]">
              Profile
            </Link>
          )}
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
          {!user && (
            <>
              <Link href="/auth?mode=login" className="flex min-h-11 items-center rounded-lg px-3 text-sm text-[#B9BBC8] transition hover:text-[#F6F0E6]">
                Log in
              </Link>
              <Link href="/auth?mode=register" className="flex min-h-11 items-center rounded-lg border border-[#E4BD70]/50 px-3 text-sm text-[#E4BD70] transition hover:bg-[#E4BD70]/10">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
