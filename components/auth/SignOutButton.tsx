"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/" })}
      className="flex min-h-11 items-center rounded-lg border border-[#30384e] px-4 text-sm text-[#9ba5c0] transition hover:border-[#c8a96e]/60 hover:text-[#e8ecf4]"
    >
      Sign out
    </button>
  );
}
