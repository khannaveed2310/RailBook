"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminTrainsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
        <p className="text-sm font-medium text-slate-500">
          Redirecting to Admin Dashboard...
        </p>
      </div>
    </div>
  );
}
