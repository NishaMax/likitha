import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireAdminPage } from "@/lib/admin-auth";

export default function AdminRootPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <AdminRootContent />
    </Suspense>
  );
}

async function AdminRootContent() {
  await requireAdminPage();
  redirect("/admin/reviews");
  return null;
}
