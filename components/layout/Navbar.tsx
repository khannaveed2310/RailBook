"use client";

import Link from "next/link";
import Image from "next/image";

import {
  Menu,
  UserRound,
  X,
  ChevronDown,
  LogOut,
  UserCircle,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import {
  getStorage,
  removeStorage,
  STORAGE_KEYS,
} from "@/lib/storage";

import type { AuthUser } from "@/types/user";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const accountRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function loadUser() {
      const authUser =
        getStorage<AuthUser | null>(
          STORAGE_KEYS.AUTH,
          null
        );

      if (
        authUser &&
        authUser.isLoggedIn
      ) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    }

    loadUser();

    function handleStorageChange() {
      loadUser();
    }

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      "railbook-auth-change",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "railbook-auth-change",
        handleStorageChange
      );
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        accountRef.current &&
        !accountRef.current.contains(
          event.target as Node
        )
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function handleLogout() {
    removeStorage(STORAGE_KEYS.AUTH);

    setUser(null);
    setAccountOpen(false);
    setMobileOpen(false);

    window.dispatchEvent(
      new Event("railbook-auth-change")
    );

    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5"
        >
          <Image
            src="/favicon.ico"
            alt="RailBook"
            width={36}
            height={36}
            className="rounded-xl"
          />

          <span className="text-xl font-bold text-slate-900">
            RailBook
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-red-600"
          >
            Search Trains
          </Link>

          <Link
            href="/bookings"
            className="text-sm font-medium text-slate-600 transition hover:text-red-600"
          >
            My Bookings
          </Link>

          <Link
            href="/passengers"
            className="text-sm font-medium text-slate-600 transition hover:text-red-600"
          >
            Passengers
          </Link>

          {user ? (
            <div
              ref={accountRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setAccountOpen(
                    (value) => !value
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:text-red-600"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <UserRound size={15} />
                </div>

                <span className="max-w-28 truncate">
                  {user.name}
                </span>

                <ChevronDown
                  size={15}
                  className={
                    accountOpen
                      ? "rotate-180 transition"
                      : "transition"
                  }
                />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  {/* User info */}
                  <div className="border-b border-slate-100 px-4 py-4">
                    <p className="font-semibold text-slate-900">
                      {user.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/profile"
                      onClick={() =>
                        setAccountOpen(false)
                      }
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                    >
                      <UserCircle size={17} />
                      Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <UserRound size={16} />
              Login
            </Link>
          )}
        </nav>

        {/* Mobile button */}
        <button
          type="button"
          onClick={() =>
            setMobileOpen(
              (value) => !value
            )
          }
          className="rounded-lg p-2 text-slate-700 md:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-4">
            <MobileLink
              href="/"
              onClick={() =>
                setMobileOpen(false)
              }
            >
              Search Trains
            </MobileLink>

            <MobileLink
              href="/bookings"
              onClick={() =>
                setMobileOpen(false)
              }
            >
              My Bookings
            </MobileLink>

            <MobileLink
              href="/passengers"
              onClick={() =>
                setMobileOpen(false)
              }
            >
              Passengers
            </MobileLink>

            {user ? (
              <>
                <div className="my-3 border-t border-slate-100" />

                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {user.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>

                <MobileLink
                  href="/profile"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                >
                  <UserCircle size={17} />
                  Profile
                </MobileLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="my-3 border-t border-slate-100" />

                <Link
                  href="/login"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  <UserRound size={16} />
                  Login
                </Link>

                <Link
                  href="/signup"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="mt-2 flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
    >
      {children}
    </Link>
  );
}