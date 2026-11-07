"use client";

import { useEffect } from "react";

function getSessionId() {
  const key = "likitha-view-session";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = `${crypto.randomUUID()}-${Date.now()}`;
  window.localStorage.setItem(key, value);
  return value;
}

export default function ViewTracker({ workId }: { workId: string }) {
  useEffect(() => {
    void fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workId, sessionId: getSessionId() }),
    });
  }, [workId]);

  return null;
}
