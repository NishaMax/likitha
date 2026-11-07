import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireAdminApi() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  }
  return null;
}

export async function requireAdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/login");
}
