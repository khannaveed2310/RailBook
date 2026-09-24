"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  TrainFront,
} from "lucide-react";

import PassengerDetails from "@/components/booking/PassengerDetails";

import {
  getSessionStorage,
  BOOKING_SELECTION_KEY,
} from "@/lib/storage";

import {
  getTrainById,
} from "@/lib/mockApi";

import type {
  BookingSelection,
} from "@/types/booking";

import type {
  Train,
} from "@/types/train";

export default function PassengerPage() {
  const router = useRouter();

  const [
    selection,
    setSelection,
  ] =
    useState<BookingSelection | null>(
      null
    );

  const [
    train,
    setTrain,
  ] =
    useState<Train | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      const storedSelection =
        getSessionStorage<BookingSelection | null>(
          BOOKING_SELECTION_KEY,
          null
        );

      if (!storedSelection) {
        router.replace("/");
        return;
      }

      const selectedTrain =
        await getTrainById(
          storedSelection.trainId
        );

      if (!selectedTrain) {
        router.replace("/");
        return;
      }

      setSelection(
        storedSelection
      );

      setTrain(
        selectedTrain
      );

      setLoading(false);
    }

    loadBooking();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  if (!selection || !train) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
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

            <span className="text-lg font-bold text-slate-900">
              RailBook
            </span>
          </Link>

          <div className="text-xs font-semibold text-slate-400">
            Step 2 of 4
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-red-600">
            PASSENGER DETAILS
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Who is travelling?
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Add the details of everyone travelling
            on this journey. You can add up to 6
            passengers.
          </p>
        </div>

        {/* Journey Summary */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Train */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                  {train.number}
                </span>

                <span className="text-xs text-slate-400">
                  {train.name}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {train.departure}
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {train.source}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-slate-300">
                  <div className="h-px w-6 bg-slate-200" />
                  <Clock3 size={15} />
                  <div className="h-px w-6 bg-slate-200" />
                </div>

                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {train.arrival}
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {train.destination}
                  </p>
                </div>
              </div>
            </div>

            {/* Journey metadata */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <JourneyInfo
                icon={
                  <CalendarDays
                    size={15}
                  />
                }
                label="Date"
                value={formatDate(
                  selection.journeyDate
                )}
              />

              <JourneyInfo
                icon={
                  <Clock3 size={15} />
                }
                label="Duration"
                value={train.duration}
              />

              <JourneyInfo
                icon={
                  <MapPin size={15} />
                }
                label="Class"
                value={
                  selection.travelClass
                }
              />
            </div>
          </div>
        </section>

        {/* Passenger Form */}
        <PassengerDetails />

        {/* Back */}
        <div className="mt-6">
          <Link
            href={`/trains/${train.id}?date=${selection.journeyDate}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-red-600"
          >
            <ArrowLeft size={16} />
            Back to train selection
          </Link>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   JOURNEY INFO
============================================================ */

function JourneyInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-1.5 text-xs font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   DATE
============================================================ */

function formatDate(
  date: string
): string {
  const parsed =
    new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}