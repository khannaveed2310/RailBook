"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Edit3,
  LogOut,
  MapPin,
  Plus,
  ShieldCheck,
  Trash2,
  TrainFront,
} from "lucide-react";

import {
  ADMIN_TRAINS_KEY,
  STORAGE_KEYS,
  getStorage,
  removeStorage,
  setStorage,
} from "@/lib/storage";

import type { AuthUser } from "@/types/user";
import type { Train } from "@/types/train";

import { trains as mockTrains } from "@/data/trains";

export default function AdminPage() {
  const router = useRouter();

  const [adminTrains, setAdminTrains] = useState<Train[]>([]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getStorage<AuthUser | null>(
      STORAGE_KEYS.AUTH,
      null
    );

    if (!auth?.isLoggedIn || auth.role !== "ADMIN") {
      router.replace("/login");
      return;
    }

    setAuthUser(auth);

    const storedTrains = getStorage<Train[]>(
      ADMIN_TRAINS_KEY,
      []
    );

    // Scope trains to current logged-in admin (default legacy trains to admin-1)
    const myTrains = storedTrains.filter(
      (train) => (train.createdById || "admin-1") === auth.id
    );

    setAdminTrains(myTrains);
    setIsLoading(false);
  }, [router]);

  function handleLogout() {
    removeStorage(STORAGE_KEYS.AUTH);
    window.dispatchEvent(
      new Event("railbook-auth-change")
    );
    router.replace("/login");
  }

  function handleDelete(trainId: string) {
    const train = adminTrains.find(
      (item) => item.id === trainId
    );

    if (!train) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${train.name}"?`
    );

    if (!confirmed) return;

    const allStoredTrains = getStorage<Train[]>(
      ADMIN_TRAINS_KEY,
      []
    );

    const updatedAllTrains = allStoredTrains.filter(
      (item) => item.id !== trainId
    );

    setStorage(ADMIN_TRAINS_KEY, updatedAllTrains);
    setAdminTrains((prev) => prev.filter((item) => item.id !== trainId));
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />

            <p className="text-sm font-medium text-slate-500">
              Loading admin dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!authUser) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Admin Dashboard
              </h1>

              <p className="text-xs text-slate-500">
                RailBook administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {authUser.name}
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={15} />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* PAGE TITLE */}
        <div className="mb-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <TrainFront
                  size={20}
                  className="text-red-600"
                />

                <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
                  Train Management
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Manage Train Routes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add, update and manage train routes for your
                booking system.
              </p>
            </div>

            <Link
              href="/admin/trains/add"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              <Plus size={17} />
              Add Route
            </Link>
          </div>
        </div>

        {/* =====================================================
            STATS
        ====================================================== */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOTAL ROUTES = MOCK + ADMIN */}
          <StatCard
            icon={<TrainFront size={19} />}
            label="Total Routes"
            value={String(
              mockTrains.length + adminTrains.length
            )}
          />

          {/* ADMIN ROUTES */}
          <StatCard
            icon={<ShieldCheck size={19} />}
            label="Admin Routes"
            value={String(adminTrains.length)}
          />

          {/* MOCK ROUTES */}
          <StatCard
            icon={<TrainFront size={19} />}
            label="Mock Routes"
            value={String(mockTrains.length)}
          />

          {/* INTERMEDIATE STATIONS */}
          <StatCard
            icon={<MapPin size={19} />}
            label="Intermediate Stations"
            value={String(
              adminTrains.reduce(
                (total, train) =>
                  total + (train.stops?.length ?? 0),
                0
              )
            )}
          />
        </div>

        {/* =====================================================
            TRAIN ROUTES
        ====================================================== */}
        <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* SECTION HEADER */}
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Train Routes
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Manage routes added by the administrator
              </p>
            </div>

            <Link
              href="/admin/trains/add"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <Plus size={16} />
              Add Route
            </Link>
          </div>

          {adminTrains.length === 0 ? (
            <EmptyRoutes />
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================== */}
              <div className="hidden w-full overflow-hidden md:block">
                <table className="w-full table-fixed border-collapse">
                  <colgroup>
                    {/* Train */}
                    <col className="w-[17%]" />

                    {/* Route */}
                    <col className="w-[20%]" />

                    {/* Timing */}
                    <col className="w-[13%]" />

                    {/* Duration */}
                    <col className="w-[8%]" />

                    {/* Running Days */}
                    <col className="w-[14%]" />

                    {/* Classes */}
                    <col className="w-[9%]" />

                    {/* Fare */}
                    <col className="w-[8%]" />

                    {/* Actions */}
                    <col className="w-[11%]" />
                  </colgroup>

                  {/* =================================================
                      TABLE HEADER
                  ================================================== */}
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Train
                      </th>

                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Route
                      </th>

                      <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Timing
                      </th>

                      <th className="px-2 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Duration
                      </th>

                      <th className="px-2 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Running Days
                      </th>

                      <th className="px-2 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Classes
                      </th>

                      <th className="px-2 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Fare
                      </th>

                      <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  {/* =================================================
                      TABLE BODY
                  ================================================== */}
                  <tbody className="divide-y divide-slate-100">
                    {adminTrains.map((train) => {
                      const startingFare =
                        train.classes.length > 0
                          ? Math.min(
                              ...train.classes.map(
                                (item) => item.fare
                              )
                            )
                          : 0;

                      return (
                        <tr
                          key={train.id}
                          className="transition-colors hover:bg-slate-50"
                        >
                          {/* TRAIN */}
                          <td className="px-4 py-4 align-top">
                            <div className="min-w-0">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">
                                  {train.number}
                                </span>

                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-600">
                                  Active
                                </span>
                              </div>

                              <p
                                className="truncate text-sm font-bold text-slate-900"
                                title={train.name}
                              >
                                {train.name}
                              </p>
                            </div>
                          </td>

                          {/* ROUTE */}
                          <td className="px-3 py-4 align-top">
                            <div className="flex min-w-0 items-start gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-medium uppercase text-slate-400">
                                  From
                                </p>

                                <p
                                  className="truncate text-sm font-semibold text-slate-900"
                                  title={train.source}
                                >
                                  {train.source}
                                </p>
                              </div>

                              <ArrowRight
                                size={15}
                                className="mt-4 shrink-0 text-slate-300"
                              />

                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-medium uppercase text-slate-400">
                                  To
                                </p>

                                <p
                                  className="truncate text-sm font-semibold text-slate-900"
                                  title={train.destination}
                                >
                                  {train.destination}
                                </p>
                              </div>
                            </div>

                            {train.stops &&
                              train.stops.length > 0 && (
                                <p className="mt-2 truncate text-[10px] font-medium text-slate-400">
                                  + {train.stops.length}{" "}
                                  intermediate{" "}
                                  {train.stops.length > 1
                                    ? "stations"
                                    : "station"}
                                </p>
                              )}
                          </td>

                          {/* TIMING */}
                          <td className="px-3 py-4 align-top">
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              <Clock3
                                size={13}
                                className="shrink-0 text-slate-400"
                              />

                              <span className="text-xs font-semibold text-slate-700">
                                {train.departure}
                              </span>

                              <ArrowRight
                                size={12}
                                className="shrink-0 text-slate-300"
                              />

                              <span className="text-xs font-semibold text-slate-700">
                                {train.arrival}
                              </span>
                            </div>
                          </td>

                          {/* DURATION */}
                          <td className="px-2 py-4 align-top">
                            <span className="inline-flex whitespace-nowrap rounded-lg bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600">
                              {train.duration}
                            </span>
                          </td>

                          {/* RUNNING DAYS */}
                          <td className="px-2 py-4 align-top">
                            <div className="flex min-w-0 flex-wrap gap-x-1 gap-y-0.5">
                              {train.runsOn.map(
                                (day, index) => (
                                  <span
                                    key={`${day}-${index}`}
                                    className="text-[10px] font-medium leading-4 text-slate-600"
                                  >
                                    {day}
                                    {index <
                                    train.runsOn.length - 1
                                      ? ","
                                      : ""}
                                  </span>
                                )
                              )}
                            </div>
                          </td>

                          {/* CLASSES */}
                          <td className="px-2 py-4 align-top">
                            <div className="flex flex-wrap gap-1">
                              {train.classes
                                .filter(
                                  (item) => item.available > 0
                                )
                                .map((item) => (
                                  <span
                                    key={item.code}
                                    className="rounded-md bg-slate-100 px-1.5 py-1 text-[9px] font-bold text-slate-600"
                                  >
                                    {item.code}
                                  </span>
                                ))}
                            </div>
                          </td>

                          {/* FARE */}
                          <td className="px-2 py-4 align-top">
                            <p className="whitespace-nowrap text-sm font-bold text-slate-900">
                              ₹{startingFare}
                            </p>

                            <p className="text-[9px] text-slate-400">
                              Starting
                            </p>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-2 py-4 align-top">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                href={`/admin/trains/edit/${train.id}`}
                                title="Edit train"
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              >
                                <Edit3 size={14} />
                              </Link>

                              <button
                                type="button"
                                title="Delete train"
                                onClick={() =>
                                  handleDelete(train.id)
                                }
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE CARDS
              ================================================== */}
              <div className="divide-y divide-slate-100 md:hidden">
                {adminTrains.map((train) => {
                  const startingFare =
                    train.classes.length > 0
                      ? Math.min(
                          ...train.classes.map(
                            (item) => item.fare
                          )
                        )
                      : 0;

                  return (
                    <div
                      key={train.id}
                      className="p-4"
                    >
                      {/* TOP */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">
                              {train.number}
                            </span>

                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-600">
                              Active
                            </span>
                          </div>

                          <h4 className="truncate text-sm font-bold text-slate-900">
                            {train.name}
                          </h4>
                        </div>

                        <div className="flex shrink-0 gap-1">
                          <Link
                            href={`/admin/trains/edit/${train.id}`}
                            title="Edit train"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Edit3 size={14} />
                          </Link>

                          <button
                            type="button"
                            title="Delete train"
                            onClick={() =>
                              handleDelete(train.id)
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* ROUTE */}
                      <div className="mt-4 rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-semibold uppercase text-slate-400">
                              From
                            </p>

                            <p className="truncate text-sm font-bold text-slate-900">
                              {train.source}
                            </p>
                          </div>

                          <ArrowRight
                            size={16}
                            className="shrink-0 text-slate-400"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-semibold uppercase text-slate-400">
                              To
                            </p>

                            <p className="truncate text-sm font-bold text-slate-900">
                              {train.destination}
                            </p>
                          </div>
                        </div>

                        {train.stops &&
                          train.stops.length > 0 && (
                            <p className="mt-2 text-[10px] font-medium text-slate-400">
                              + {train.stops.length}{" "}
                              intermediate{" "}
                              {train.stops.length > 1
                                ? "stations"
                                : "station"}
                            </p>
                          )}
                      </div>

                      {/* DETAILS */}
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <p className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase text-slate-400">
                            <Clock3 size={11} />
                            Timing
                          </p>

                          <p className="text-xs font-semibold text-slate-700">
                            {train.departure} →{" "}
                            {train.arrival}
                          </p>
                        </div>

                        <div>
                          <p className="mb-1 text-[9px] font-semibold uppercase text-slate-400">
                            Duration
                          </p>

                          <span className="inline-flex rounded-md bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600">
                            {train.duration}
                          </span>
                        </div>

                        <div>
                          <p className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase text-slate-400">
                            <CalendarDays size={11} />
                            Running
                          </p>

                          <p className="text-[10px] font-medium leading-4 text-slate-600">
                            {train.runsOn.join(", ")}
                          </p>
                        </div>

                        <div>
                          <p className="mb-1 text-[9px] font-semibold uppercase text-slate-400">
                            Starting Fare
                          </p>

                          <p className="text-sm font-bold text-slate-900">
                            ₹{startingFare}
                          </p>
                        </div>
                      </div>

                      {/* CLASSES */}
                      <div className="mt-4">
                        <p className="mb-2 text-[9px] font-semibold uppercase text-slate-400">
                          Available Classes
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {train.classes
                            .filter(
                              (item) => item.available > 0
                            )
                            .map((item) => (
                              <span
                                key={item.code}
                                className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600"
                              >
                                {item.code}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   EMPTY ROUTES
========================================================= */

function EmptyRoutes() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <TrainFront size={25} />
      </div>

      <h3 className="text-base font-bold text-slate-900">
        No train routes yet
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Add your first train route to start managing
        availability and schedules.
      </p>

      <Link
        href="/admin/trains/add"
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        <Plus size={16} />
        Add Route
      </Link>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
          {icon}
        </div>

        <span className="text-xl font-bold text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-3 text-xs font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}