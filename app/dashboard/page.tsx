import { Suspense } from "react";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div className="min-h-screen" />}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
