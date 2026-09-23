"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getStorage,
  STORAGE_KEYS,
} from "@/lib/storage";

import type { AuthUser } from "@/types/user";

interface HomeAuthGuardProps {
  children: React.ReactNode;
}

export default function HomeAuthGuard({
  children,
}: HomeAuthGuardProps) {
  const router = useRouter();

  const [checking, setChecking] =
    useState(true);

  const [authenticated, setAuthenticated] =
    useState(false);

  useEffect(() => {
    const authUser =
      getStorage<AuthUser | null>(
        STORAGE_KEYS.AUTH,
        null
      );

    if (
      !authUser ||
      !authUser.isLoggedIn
    ) {
      router.replace("/login");
      return;
    }

    setAuthenticated(true);
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-red-500" />

          <p className="mt-4 text-sm text-slate-400">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}