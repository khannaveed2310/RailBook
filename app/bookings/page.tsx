"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MapPin,
  Ticket,
  TrainFront,
  Users,
  X,
  XCircle,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import {
  getStorage,
  setStorage,
  STORAGE_KEYS,
} from "@/lib/storage";

import {
  formatCurrency,
} from "@/lib/utils";

import type {
  Booking,
} from "@/types/booking";

export default function BookingsPage() {
  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState<Booking | null>(
    null
  );

  const [
    showCancelModal,
    setShowCancelModal,
  ] = useState(false);

  /* ==========================================================
     LOAD BOOKINGS
  ========================================================== */

  useEffect(() => {
    const storedBookings =
      getStorage<Booking[]>(
        STORAGE_KEYS.BOOKINGS,
        []
      );

    /*
     * Show newest bookings first.
     */
    const sortedBookings =
      [...storedBookings].sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );

    setBookings(
      sortedBookings
    );

    setLoading(false);
  }, []);

  /* ==========================================================
     CANCEL BOOKING
  ========================================================== */

  function openCancelModal(
    booking: Booking
  ) {
    setSelectedBooking(
      booking
    );

    setShowCancelModal(true);
  }

  function closeCancelModal() {
    setSelectedBooking(null);
    setShowCancelModal(false);
  }

  function confirmCancellation() {
    if (!selectedBooking) {
      return;
    }

    const updatedBookings =
      bookings.map(
        (booking) =>
          booking.id ===
          selectedBooking.id
            ? {
                ...booking,
                status:
                  "CANCELLED" as const,
              }
            : booking
      );

    setBookings(
      updatedBookings
    );

    setStorage(
      STORAGE_KEYS.BOOKINGS,
      updatedBookings
    );

    closeCancelModal();
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading your bookings...
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-red-600">
            TRAVEL HISTORY
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            My Bookings
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            View your confirmed and cancelled
            railway bookings.
          </p>
        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {bookings.length === 0 ? (
          <EmptyBookings />
        ) : (
          <div className="space-y-5">
            {bookings.map(
              (booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={
                    openCancelModal
                  }
                />
              )
            )}
          </div>
        )}

        {/* Back */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-red-600"
          >
            <ArrowRight
              size={16}
              className="rotate-180"
            />
            Search another train
          </Link>
        </div>
      </main>

      <Footer />

      {/* =====================================================
          CANCEL MODAL
      ===================================================== */}

      {showCancelModal &&
        selectedBooking && (
          <CancelModal
            booking={
              selectedBooking
            }
            onCancel={
              closeCancelModal
            }
            onConfirm={
              confirmCancellation
            }
          />
        )}
    </div>
  );
}

/* ============================================================
   BOOKING CARD
============================================================ */

function BookingCard({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel: (
    booking: Booking
  ) => void;
}) {
  const isCancelled =
    booking.status ===
    "CANCELLED";

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
        isCancelled
          ? "border-slate-200 opacity-90"
          : "border-slate-200"
      }`}
    >
      {/* Top */}
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isCancelled
                ? "bg-slate-100 text-slate-400"
                : "bg-red-50 text-red-600"
            }`}
          >
            <Ticket size={19} />
          </div>

          <div>
            <p className="text-xs text-slate-400">
              PNR
            </p>

            <p className="mt-0.5 font-bold tracking-wide text-slate-900">
              {booking.pnr}
            </p>
          </div>
        </div>

        <StatusBadge
          status={
            booking.status
          }
        />
      </div>

      {/* Main */}
      <div className="p-5 sm:p-6">
        {/* Train */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                {booking.trainNumber}
              </span>

              <span className="text-xs text-slate-400">
                {booking.travelClass}
                {" • "}
                {formatQuota(
                  booking.quota
                )}
              </span>
            </div>

            <h2 className="mt-2 text-lg font-bold text-slate-900">
              {booking.trainName}
            </h2>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3 lg:min-w-36">
            <p className="text-xs text-slate-400">
              Total Fare
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {formatCurrency(
                booking.totalAmount
              )}
            </p>
          </div>
        </div>

        {/* Route */}
        <div className="mt-6 rounded-xl border border-slate-100 p-4">
          <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <RoutePoint
              time={getTime(
                booking,
                "departure"
              )}
              location={
                booking.source
              }
              label="Departure"
            />

            <div className="flex items-center justify-center gap-2 text-slate-300">
              <div className="hidden h-px w-8 bg-slate-200 md:block" />

              <TrainFront
                size={17}
              />

              <div className="hidden h-px w-8 bg-slate-200 md:block" />
            </div>

            <RoutePoint
              time={getTime(
                booking,
                "arrival"
              )}
              location={
                booking.destination
              }
              label="Arrival"
              align="right"
            />
          </div>
        </div>

        {/* Details */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailBox
            icon={
              <CalendarDays
                size={16}
              />
            }
            label="Journey Date"
            value={formatDate(
              booking.journeyDate
            )}
          />

          <DetailBox
            icon={
              <Users size={16} />
            }
            label="Passengers"
            value={`${booking.passengers.length} Passenger${
              booking.passengers.length >
              1
                ? "s"
                : ""
            }`}
          />

          <DetailBox
            icon={
              <Ticket size={16} />
            }
            label="Coach"
            value={
              booking.coach ??
              "Not Assigned"
            }
          />

          <DetailBox
            icon={
              <MapPin size={16} />
            }
            label="Seats"
            value={
              booking.seats?.join(
                ", "
              ) ?? "Not Assigned"
            }
          />
        </div>

        {/* Passengers */}
        <div className="mt-5 border-t border-slate-100 pt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Passengers
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {booking.passengers.map(
              (
                passenger,
                index
              ) => (
                <div
                  key={
                    passenger.id
                  }
                  className="rounded-lg bg-slate-50 px-3 py-2"
                >
                  <p className="text-xs font-semibold text-slate-800">
                    {index + 1}.{" "}
                    {passenger.name}
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {passenger.age} yrs
                    {" • "}
                    {formatGender(
                      passenger.gender
                    )}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            href={`/booking/confirmation?pnr=${booking.pnr}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:text-red-600"
          >
            <Ticket size={16} />
            View Ticket
          </Link>

          {!isCancelled && (
            <button
              type="button"
              onClick={() =>
                onCancel(
                  booking
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <XCircle
                size={16}
              />
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   EMPTY
============================================================ */

function EmptyBookings() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Ticket size={28} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-900">
        No bookings yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Your confirmed train bookings will appear
        here after you complete a booking.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
      >
        <TrainFront size={17} />
        Search Trains
      </Link>
    </div>
  );
}

/* ============================================================
   CANCEL MODAL
============================================================ */

function CancelModal({
  booking,
  onCancel,
  onConfirm,
}: {
  booking: Booking;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">
            Cancel Booking
          </h2>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
            <XCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="text-sm font-bold text-red-900">
                Are you sure?
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                This will mark your booking as
                cancelled. This action cannot be
                undone in this demo.
              </p>
            </div>
          </div>

          {/* Booking */}
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              PNR
            </p>

            <p className="mt-1 font-bold tracking-wide text-slate-900">
              {booking.pnr}
            </p>

            <p className="mt-3 text-sm font-semibold text-slate-800">
              {booking.trainName}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {booking.source}
              {" → "}
              {booking.destination}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {formatDate(
                booking.journeyDate
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Keep Booking
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Yes, Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS
============================================================ */

function StatusBadge({
  status,
}: {
  status: Booking["status"];
}) {
  if (status === "CANCELLED") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
        <XCircle size={14} />
        Cancelled
      </span>
    );
  }

  if (status === "COMPLETED") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
        <CheckCircle2 size={14} />
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-600">
      <CheckCircle2 size={14} />
      Confirmed
    </span>
  );
}

/* ============================================================
   ROUTE POINT
============================================================ */

function RoutePoint({
  time,
  location,
  label,
  align = "left",
}: {
  time: string;
  location: string;
  label: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={
        align === "right"
          ? "text-left md:text-right"
          : ""
      }
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-900">
        {time}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {location}
      </p>
    </div>
  );
}

/* ============================================================
   DETAIL BOX
============================================================ */

function DetailBox({
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

        <span className="text-[10px] font-bold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
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
  quota: Booking["quota"]
): string {
  const labels: Record<
    Booking["quota"],
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
  gender: Booking["passengers"][number]["gender"]
): string {
  const labels: Record<
    "MALE" | "FEMALE" | "OTHER",
    string
  > = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
  };

  return labels[gender];
}

/*
 * Booking currently doesn't store departure/
 * arrival times, so this helper uses the mock
 * train data only if you later add those fields.
 *
 * For now these values are placeholders based
 * on the booking flow.
 */
function getTime(
  booking: Booking,
  type: "departure" | "arrival"
): string {
  return type === "departure"
    ? booking.departure
    : booking.arrival;
}