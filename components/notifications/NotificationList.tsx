"use client";

import Link from "next/link";
import { useState } from "react";

type NotificationItem = { id: string; message: string; href: string | null; isRead: boolean; createdAt: string };

export default function NotificationList({ notifications: initial }: { notifications: NotificationItem[] }) {
  const [notifications, setNotifications] = useState(initial);
  const [error, setError] = useState("");

  async function markRead(notificationId?: string) {
    setError("");
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notificationId ? { action: "read", notificationId } : { action: "readAll" }),
    });
    if (!response.ok) {
      setError("Unable to update notifications.");
      return;
    }
    setNotifications((current) => notificationId
      ? current.map((item) => item.id === notificationId ? { ...item, isRead: true } : item)
      : current.map((item) => ({ ...item, isRead: true })));
  }

  return (
    <div className="mt-8">
      <div className="flex justify-end">
        <button type="button" onClick={() => void markRead()} className="min-h-11 rounded-lg border border-[#30384e] px-4 text-sm text-[#c8a96e] hover:border-[#c8a96e]">Mark all read</button>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-[#fca5a5]">{error}</p>}
      <div className="mt-5 divide-y divide-[#252d40] rounded-2xl border border-[#252d40] bg-[#171b26]">
        {notifications.map((notification) => {
          const content = <div className={`p-5 ${notification.isRead ? "" : "border-l-2 border-[#c8a96e] bg-[#c8a96e]/[.04]"}`}><p className="text-sm leading-7 text-[#e8ecf4]">{notification.message}</p><p className="mt-2 text-xs text-[#6f7890]">{new Date(notification.createdAt).toLocaleString()}</p></div>;
          return notification.href ? <Link key={notification.id} href={notification.href} onClick={() => void markRead(notification.id)}>{content}</Link> : <button key={notification.id} type="button" onClick={() => void markRead(notification.id)} className="block w-full text-left">{content}</button>;
        })}
        {notifications.length === 0 && <p className="p-6 text-sm text-[#6f7890]">You are all caught up.</p>}
      </div>
    </div>
  );
}
