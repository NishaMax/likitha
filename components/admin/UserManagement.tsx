"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UserItem = {
  id: string;
  email: string;
  displayName: string;
  username: string;
  role: "READER" | "WRITER" | "ADMIN";
  tier: string;
  isBanned: boolean;
  createdAt: string;
  _count: { works: number; comments: number };
};

export default function UserManagement({ users }: { users: UserItem[] }) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const filteredUsers = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return users;
    return users.filter((user) => [user.displayName, user.email, user.username].some((field) => field.toLowerCase().includes(value)));
  }, [query, users]);

  async function toggle(user: UserItem) {
    setBusy(user.id);
    setError("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action: user.isBanned ? "unban" : "ban" }),
      });
      if (!response.ok) {
        const body = await response.json() as { error?: string };
        setError(body.error ?? "Unable to update this user.");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to reach Likitha. Try again.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[.15em] text-[#c8a96e]">People</p>
          <h2 className="mt-2 font-serif text-2xl text-[#e8ecf4]">User management</h2>
        </div>
        <span className="text-sm text-[#6f7890]">{filteredUsers.length} users</span>
      </div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, email, or username..." className="mt-5 min-h-12 w-full rounded-xl border border-[#30384e] bg-[#171b26] px-4 text-sm text-[#e8ecf4] outline-none focus:border-[#c8a96e]" />
      {error && <p role="alert" className="mt-4 rounded-lg border border-[#f87171]/30 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]">{error}</p>}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {filteredUsers.map((user) => (
          <article key={user.id} className={`rounded-2xl border p-5 ${user.isBanned ? "border-[#f87171]/30 bg-[#24191d]" : "border-[#252d40] bg-[#171b26]"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-[#e8ecf4]">{user.displayName || "Unnamed user"}</h3>
                <p className="mt-1 truncate text-xs text-[#9ba5c0]">{user.email}</p>
                <p className="mt-1 truncate text-xs text-[#6f7890]">@{user.username}</p>
              </div>
              <span className="shrink-0 rounded-full border border-[#30384e] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-[#c8a96e]">{user.role}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#6f7890]">
              <span>{user.tier}</span>
              <span>{user._count.works} works</span>
              <span>{user._count.comments} comments</span>
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              {user.isBanned && <span className="text-xs font-semibold text-[#fca5a5]">Banned</span>}
              <button type="button" onClick={() => void toggle(user)} disabled={busy === user.id} className={`ml-auto min-h-11 rounded-lg border px-4 text-sm disabled:opacity-60 ${user.isBanned ? "border-[#86efac]/40 text-[#bbf7d0]" : "border-[#f87171]/40 text-[#fca5a5]"}`}>
                {busy === user.id ? "Saving..." : user.isBanned ? "Unban user" : "Ban user"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {filteredUsers.length === 0 && <p className="mt-5 text-sm text-[#6f7890]">No users match your search.</p>}
    </section>
  );
}
