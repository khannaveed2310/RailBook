"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, ShieldCheck, Mail, Phone, LogOut, ArrowLeft } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getStorage, removeStorage, STORAGE_KEYS } from "@/lib/storage";
import type { AuthUser } from "@/types/user";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authUser = getStorage<AuthUser | null>(STORAGE_KEYS.AUTH, null);
    if (!authUser || !authUser.isLoggedIn) {
      router.replace("/login");
      return;
    }
    setUser(authUser);
    setLoading(false);
  }, [router]);

  function handleLogout() {
    removeStorage(STORAGE_KEYS.AUTH);
    window.dispatchEvent(new Event("railbook-auth-change"));
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
            <p className="mt-4 text-sm text-slate-500">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-red-600"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-slate-200 bg-slate-900 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md">
                  {user.role === "ADMIN" ? (
                    <ShieldCheck size={32} />
                  ) : (
                    <User size={32} />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        user.role === "ADMIN"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                </div>
              </div>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <ShieldCheck size={17} />
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">Account Details</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <User size={15} />
                  Full Name
                </div>
                <p className="mt-2 text-base font-bold text-slate-800">
                  {user.name}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Mail size={15} />
                  Email Address
                </div>
                <p className="mt-2 text-base font-bold text-slate-800">
                  {user.email}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Phone size={15} />
                  Phone Number
                </div>
                <p className="mt-2 text-base font-bold text-slate-800">
                  {user.phone || "Not provided"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <ShieldCheck size={15} />
                  Account Role
                </div>
                <p className="mt-2 text-base font-bold text-slate-800">
                  {user.role === "ADMIN" ? "Administrator" : "Passenger User"}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                <LogOut size={17} />
                Logout of Account
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
