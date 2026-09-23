"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  MapPin,
  TrainFront,
  Users,
} from "lucide-react";

import {
  getSessionStorage,
  BOOKING_PASSENGERS_KEY,
  BOOKING_SELECTION_KEY,
} from "@/lib/storage";

import {
  calculateFare,
  formatCurrency,
} from "@/lib/utils";

import { getTrainById } from "@/lib/mockApi";

import type {
  BookingSelection,
} from "@/types/booking";

import type {
  Passenger,
} from "@/types/passenger";

import type {
  Train,
} from "@/types/train";

export default function BookingReviewPage() {
  const router = useRouter();

  const [selection, setSelection] =
    useState<BookingSelection | null>(
      null
    );

  const [passengers, setPassengers] =
    useState<Passenger[]>([]);

  const [train, setTrain] =
    useState<Train | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadBookingData() {
      try {
        const storedSelection =
          getSessionStorage<BookingSelection | null>(
            BOOKING_SELECTION_KEY,
            null
          );

        const storedPassengers =
          getSessionStorage<Passenger[]>(
            BOOKING_PASSENGERS_KEY,
            []
          );

        if (
          !storedSelection ||
          storedPassengers.length === 0
        ) {
          router.replace(
            "/booking/passenger"
          );
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

        setPassengers(
          storedPassengers
        );

        setTrain(
          selectedTrain
        );

        setLoading(false);
      } catch (error) {
        console.error(
          "Failed to load booking review:",
          error
        );

        router.replace("/");
      }
    }

    loadBookingData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />

          <p className="mt-4 text-sm text-slate-500">
            Preparing your booking...
          </p>
        </div>
      </div>
    );
  }

  if (
    !selection ||
    !train ||
    passengers.length === 0
  ) {
    return null;
  }

  const fare = calculateFare(
    selection.fare,
    passengers.length
  );

  const selectedClass =
    train.classes.find(
      (item) =>
        item.code ===
        selection.travelClass
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white">
              <TrainFront size={19} />
            </div>

            <span className="text-lg font-bold text-slate-900">
              RailBook
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2 text-xs font-semibold text-slate-500">
            <CheckCircle2
              size={15}
              className="text-green-500"
            />
            Review Booking
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-red-600">
            STEP 3 OF 5
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Review your booking
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Check your journey, passengers and
            fare details before proceeding to
            payment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Train */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-2">
                  <TrainFront
                    size={18}
                    className="text-red-600"
                  />

                  <h2 className="font-bold text-slate-900">
                    Train Details
                  </h2>
                </div>

                <Link
                  href={`/trains/${train.id}?date=${selection.journeyDate}`}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Edit3 size={14} />
                  Edit
                </Link>
              </div>

              <div className="p-5">
                {/* Train heading */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                        {train.number}
                      </span>

                      <span className="text-xs text-slate-400">
                        {selectedClass?.name ??
                          selection.travelClass}
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-slate-900">
                      {train.name}
                    </h3>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600">
                    <CheckCircle2 size={14} />
                    Available
                  </div>
                </div>

                {/* Route */}
                <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {train.departure}
                    </p>

                    <p className="mt-1 font-semibold text-slate-700">
                      {train.source}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Departure
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="hidden h-px w-10 bg-slate-200 sm:block" />

                    <Clock3 size={18} />

                    <div className="h-px w-10 bg-slate-200" />
                  </div>

                  <div className="sm:text-right">
                    <p className="text-2xl font-bold text-slate-900">
                      {train.arrival}
                    </p>

                    <p className="mt-1 font-semibold text-slate-700">
                      {train.destination}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Arrival
                    </p>
                  </div>
                </div>

                {/* Journey info */}
                <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
                  <InfoItem
                    icon={
                      <CalendarDays
                        size={16}
                      />
                    }
                    label="Journey Date"
                    value={formatDate(
                      selection.journeyDate
                    )}
                  />

                  <InfoItem
                    icon={
                      <Clock3 size={16} />
                    }
                    label="Duration"
                    value={train.duration}
                  />

                  <InfoItem
                    icon={
                      <MapPin size={16} />
                    }
                    label="Quota"
                    value={formatQuota(
                      selection.quota
                    )}
                  />
                </div>
              </div>
            </section>

            {/* Passengers */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Users
                    size={18}
                    className="text-red-600"
                  />

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Passenger Details
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {passengers.length} passenger
                      {passengers.length > 1
                        ? "s"
                        : ""}
                    </p>
                  </div>
                </div>

                <Link
                  href="/booking/passenger"
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Edit3 size={14} />
                  Edit
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {passengers.map(
                  (passenger, index) => (
                    <div
                      key={passenger.id}
                      className="flex items-center gap-4 p-5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">
                          {passenger.name}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>
                            Age:{" "}
                            {passenger.age}
                          </span>

                          <span>
                            Gender:{" "}
                            {formatGender(
                              passenger.gender
                            )}
                          </span>

                          <span>
                            Berth:{" "}
                            {formatBerth(
                              passenger.berthPreference
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside>
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-950 px-5 py-4">
                <h2 className="font-bold text-white">
                  Fare Summary
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {passengers.length} passenger
                  {passengers.length > 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="space-y-4 p-5">
                <FareRow
                  label={`Base Fare (${passengers.length} × ${formatCurrency(
                    selection.fare
                  )})`}
                  amount={fare.baseFare}
                />

                <FareRow
                  label={`Reservation Fee (${passengers.length} × ₹40)`}
                  amount={
                    fare.reservationFee
                  }
                />

                <FareRow
                  label="GST"
                  amount={fare.gst}
                />

                <div className="border-t border-dashed border-slate-200 pt-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Total Amount
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Inclusive of applicable charges
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(
                        fare.totalAmount
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/booking/payment"
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Proceed to Mock Payment
                  <ArrowRight size={17} />
                </button>

                <div className="flex gap-2 rounded-xl bg-slate-50 p-3">
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0 text-green-500"
                  />

                  <p className="text-[11px] leading-5 text-slate-500">
                    This is a frontend assessment
                    simulation. No real payment will
                    be processed.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Back */}
        <div className="mt-6">
          <Link
            href="/booking/passenger"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-red-600"
          >
            <ArrowLeft size={16} />
            Back to passenger details
          </Link>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function FareRow({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="whitespace-nowrap text-sm font-semibold text-slate-800">
        {formatCurrency(amount)}
      </p>
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function formatDate(
  date: string
): string {
  if (!date) return "-";

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

function formatQuota(
  quota: BookingSelection["quota"]
): string {
  const labels: Record<
    BookingSelection["quota"],
    string
  > = {
    GENERAL: "General",
    TATKAL: "Tatkal",
    LADIES: "Ladies",
    SENIOR_CITIZEN:
      "Senior Citizen",
  };

  return labels[quota];
}

function formatGender(
  gender: Passenger["gender"]
): string {
  const labels: Record<
    Passenger["gender"],
    string
  > = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
  };

  return labels[gender];
}

function formatBerth(
  berth: Passenger["berthPreference"]
): string {
  const labels: Record<
    Passenger["berthPreference"],
    string
  > = {
    LOWER: "Lower",
    MIDDLE: "Middle",
    UPPER: "Upper",
    SIDE_LOWER: "Side Lower",
    SIDE_UPPER: "Side Upper",
    NO_PREFERENCE:
      "No Preference",
  };

  return labels[berth];
}