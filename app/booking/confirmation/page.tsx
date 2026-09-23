"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Home,
  MapPin,
  Ticket,
  TrainFront,
  Users,
} from "lucide-react";

import {
  getSessionStorage,
  getStorage,
  setStorage,
  removeSessionStorage,
  BOOKING_PASSENGERS_KEY,
  BOOKING_SELECTION_KEY,
  STORAGE_KEYS,
} from "@/lib/storage";

import {
  calculateFare,
  formatCurrency,
  generateId,
  generatePNR,
} from "@/lib/utils";

import {
  getTrainById,
} from "@/lib/mockApi";

import type {
  Booking,
} from "@/types/booking";

import type {
  BookingSelection,
} from "@/types/booking";

import type {
  Passenger,
} from "@/types/passenger";

import type {
  Train,
} from "@/types/train";

/* ============================================================
   PAGE
============================================================ */

export default function BookingConfirmationPage() {
  /*
   * Prevent duplicate booking creation.
   *
   * This is especially important in development because
   * React Strict Mode can run effects more than once.
   */
  const creationStartedRef =
    useRef(false);

  const [
    booking,
    setBooking,
  ] = useState<Booking | null>(
    null
  );

  const [
    train,
    setTrain,
  ] = useState<Train | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* ==========================================================
     CONFIRMATION / EXISTING TICKET
  ========================================================== */

  useEffect(() => {
    /*
     * Stop duplicate execution inside the same
     * component lifecycle.
     */
    if (creationStartedRef.current) {
      return;
    }

    creationStartedRef.current = true;

    async function handleBookingConfirmation() {
      try {
        /*
         * =====================================================
         * CHECK URL FOR EXISTING PNR
         *
         * Example:
         *
         * /booking/confirmation?pnr=7544991144
         *
         * If PNR exists, we DO NOT create a new booking.
         * We simply load the existing booking.
         * =====================================================
         */

        const searchParams =
          new URLSearchParams(
            window.location.search
          );

        const existingPnr =
          searchParams.get("pnr");

        /*
         * Always load existing bookings first.
         */
        const existingBookings =
          getStorage<Booking[]>(
            STORAGE_KEYS.BOOKINGS,
            []
          );

        /* =====================================================
           EXISTING TICKET VIEW
        ===================================================== */

        if (existingPnr) {
          const existingBooking =
            existingBookings.find(
              (item) =>
                item.pnr ===
                existingPnr
            );

          if (!existingBooking) {
            setError(
              "The requested booking could not be found."
            );

            setLoading(false);
            return;
          }

          /*
           * Get train information.
           *
           * This is useful for older bookings that were created
           * before departure/arrival/duration were stored.
           */
          const existingTrain =
            await getTrainById(
              existingBooking.trainId
            );

          /*
           * For old bookings, populate missing train timing
           * information from the current mock train data.
           */
          if (existingTrain) {
            setTrain(
              existingTrain
            );
          }

          setBooking(
            existingBooking
          );

          setLoading(false);

          return;
        }

        /* =====================================================
           NEW BOOKING
        ===================================================== */

        /*
         * Check payment status.
         */
        const paymentStatus =
          sessionStorage.getItem(
            "railbook_payment_status"
          );

        if (
          paymentStatus !==
          "SUCCESS"
        ) {
          setError(
            "Payment was not completed. Please return to the payment page."
          );

          setLoading(false);

          return;
        }

        /*
         * =====================================================
         * GET BOOKING SELECTION
         * =====================================================
         */

        const selection =
          getSessionStorage<BookingSelection | null>(
            BOOKING_SELECTION_KEY,
            null
          );

        /*
         * =====================================================
         * GET PASSENGERS
         * =====================================================
         */

        const passengers =
          getSessionStorage<Passenger[]>(
            BOOKING_PASSENGERS_KEY,
            []
          );

        if (
          !selection ||
          passengers.length === 0
        ) {
          setError(
            "Booking information could not be found."
          );

          setLoading(false);

          return;
        }

        /*
         * =====================================================
         * GET SELECTED TRAIN
         * =====================================================
         */

        const selectedTrain =
          await getTrainById(
            selection.trainId
          );

        if (!selectedTrain) {
          setError(
            "Selected train could not be found."
          );

          setLoading(false);

          return;
        }

        /*
         * =====================================================
         * CALCULATE FARE
         * =====================================================
         */

        const fare =
          calculateFare(
            selection.fare,
            passengers.length
          );

        /*
         * =====================================================
         * GENERATE PNR
         * =====================================================
         */

        const pnr =
          generatePNR();

        /*
         * =====================================================
         * CREATE BOOKING
         * =====================================================
         */

        const newBooking: Booking = {
          id: generateId(
            "booking"
          ),

          pnr,

          /*
           * Train
           */
          trainId:
            selectedTrain.id,

          trainNumber:
            selectedTrain.number,

          trainName:
            selectedTrain.name,

          /*
           * Route
           */
          source:
            selectedTrain.source,

          destination:
            selectedTrain.destination,

          /*
           * IMPORTANT:
           * Store these values so My Bookings can
           * display them without needing the train again.
           */
          departure:
            selectedTrain.departure,

          arrival:
            selectedTrain.arrival,

          duration:
            selectedTrain.duration,

          /*
           * Journey
           */
          journeyDate:
            selection.journeyDate,

          travelClass:
            selection.travelClass,

          quota:
            selection.quota,

          /*
           * Passengers
           */
          passengers,

          /*
           * Fare
           */
          baseFare:
            fare.baseFare,

          reservationFee:
            fare.reservationFee,

          gst:
            fare.gst,

          totalAmount:
            fare.totalAmount,

          /*
           * Status
           */
          status:
            "CONFIRMED",

          /*
           * Mock seat assignment
           */
          coach:
            generateCoach(),

          seats:
            generateSeats(
              passengers.length
            ),

          /*
           * Created
           */
          createdAt:
            new Date().toISOString(),
        };

        /*
         * =====================================================
         * SAVE BOOKING
         * =====================================================
         */

        setStorage(
          STORAGE_KEYS.BOOKINGS,
          [
            ...existingBookings,
            newBooking,
          ]
        );

        /*
         * Save latest booking separately.
         */
        setStorage(
          "railbook_latest_booking",
          newBooking
        );

        /*
         * =====================================================
         * CLEAR TEMPORARY BOOKING DATA
         * =====================================================
         */

        removeSessionStorage(
          BOOKING_SELECTION_KEY
        );

        removeSessionStorage(
          BOOKING_PASSENGERS_KEY
        );

        /*
         * Remove payment status so the same payment
         * cannot be used to create another booking.
         */
        sessionStorage.removeItem(
          "railbook_payment_status"
        );

        sessionStorage.removeItem(
          "railbook_payment_method"
        );

        /*
         * =====================================================
         * UPDATE UI
         * =====================================================
         */

        setTrain(
          selectedTrain
        );

        setBooking(
          newBooking
        );

        setLoading(false);
      } catch (err) {
        console.error(
          "Booking confirmation failed:",
          err
        );

        setError(
          "Something went wrong while creating your booking."
        );

        setLoading(false);
      }
    }

    handleBookingConfirmation();
  }, []);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            Confirming your booking...
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please wait while we generate your
            ticket.
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error ||
    !booking
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Ticket size={25} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Unable to confirm booking
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  /*
   * Train can be null when viewing an older booking.
   *
   * We use the booking itself for timing information
   * whenever possible.
   */
  const departureTime =
    booking.departure ||
    train?.departure ||
    "—";

  const arrivalTime =
    booking.arrival ||
    train?.arrival ||
    "—";

  const duration =
    booking.duration ||
    train?.duration ||
    "—";

  /* ==========================================================
     CONFIRMATION
  ========================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
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

          <div className="flex items-center gap-2 text-xs font-semibold text-green-600">
            <CheckCircle2
              size={15}
            />
            Booking Confirmed
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ===================================================
            SUCCESS
        =================================================== */}

        <section className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check
              size={38}
              strokeWidth={3}
            />
          </div>

          <p className="mt-5 text-sm font-bold uppercase tracking-wider text-green-600">
            Payment Successful
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Your ticket is confirmed!
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Your railway booking has been successfully
            created. Keep your PNR handy for future
            reference.
          </p>
        </section>

        {/* ===================================================
            PNR
        =================================================== */}

        <section className="mx-auto mt-8 max-w-2xl rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-green-700">
            PNR Number
          </p>

          <p className="mt-2 text-3xl font-black tracking-[0.2em] text-green-800">
            {booking.pnr}
          </p>

          <p className="mt-2 text-xs text-green-700">
            Booking ID:{" "}
            {booking.id}
          </p>
        </section>

        {/* ===================================================
            TICKET
        =================================================== */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Ticket Header */}
          <div className="border-b border-slate-200 bg-slate-950 px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Ticket
                    size={19}
                    className="text-red-400"
                  />

                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    E-Ticket
                  </span>
                </div>

                <h2 className="mt-2 text-xl font-bold text-white">
                  {booking.trainName}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Train No.{" "}
                  {booking.trainNumber}
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-400">
                <CheckCircle2
                  size={14}
                />
                {booking.status}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {/* =================================================
                ROUTE
            ================================================= */}

            <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <StationBlock
                time={
                  departureTime
                }
                station={
                  booking.source
                }
                label="Departure"
              />

              <div className="flex items-center justify-center gap-3 text-slate-300">
                <div className="hidden h-px w-16 bg-slate-200 md:block" />

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <TrainFront
                    size={18}
                  />
                </div>

                <div className="hidden h-px w-16 bg-slate-200 md:block" />
              </div>

              <StationBlock
                time={
                  arrivalTime
                }
                station={
                  booking.destination
                }
                label="Arrival"
                align="right"
              />
            </div>

            {/* =================================================
                JOURNEY META
            ================================================= */}

            <div className="mt-7 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-3">
              <TicketInfo
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

              <TicketInfo
                icon={
                  <Clock3 size={16} />
                }
                label="Duration"
                value={
                  duration
                }
              />

              <TicketInfo
                icon={
                  <MapPin
                    size={16}
                  />
                }
                label="Class / Quota"
                value={`${booking.travelClass} / ${formatQuota(
                  booking.quota
                )}`}
              />
            </div>

            {/* Divider */}
            <div className="my-7 border-t border-dashed border-slate-200" />

            {/* =================================================
                PASSENGERS
            ================================================= */}

            <div>
              <div className="flex items-center gap-2">
                <Users
                  size={18}
                  className="text-red-600"
                />

                <h3 className="font-bold text-slate-900">
                  Passengers
                </h3>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                {/* Desktop Header */}
                <div className="hidden grid-cols-[50px_1fr_100px_100px_140px] bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:grid">
                  <span>No.</span>
                  <span>Name</span>
                  <span>Age</span>
                  <span>Gender</span>
                  <span>Berth</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {booking.passengers.map(
                    (
                      passenger,
                      index
                    ) => (
                      <div
                        key={
                          passenger.id
                        }
                        className="grid gap-2 px-4 py-4 sm:grid-cols-[50px_1fr_100px_100px_140px] sm:items-center"
                      >
                        <span className="text-xs font-bold text-slate-400">
                          {index + 1}
                        </span>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {
                              passenger.name
                            }
                          </p>

                          {/* Mobile */}
                          <p className="mt-1 text-xs text-slate-400 sm:hidden">
                            {passenger.age} yrs
                            {" • "}
                            {formatGender(
                              passenger.gender
                            )}
                            {" • "}
                            {formatBerth(
                              passenger.berthPreference
                            )}
                          </p>
                        </div>

                        {/* Age */}
                        <span className="hidden text-sm text-slate-600 sm:block">
                          {
                            passenger.age
                          }
                        </span>

                        {/* Gender */}
                        <span className="hidden text-sm text-slate-600 sm:block">
                          {formatGender(
                            passenger.gender
                          )}
                        </span>

                        {/* Berth */}
                        <span className="hidden text-sm text-slate-600 sm:block">
                          {formatBerth(
                            passenger.berthPreference
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="my-7 border-t border-dashed border-slate-200" />

            {/* =================================================
                FARE
            ================================================= */}

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Booking Information
                </p>

                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-slate-500">
                    Booking Status:

                    <span
                      className={`ml-2 font-semibold ${
                        booking.status ===
                        "CANCELLED"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatStatus(
                        booking.status
                      )}
                    </span>
                  </p>

                  <p className="text-slate-500">
                    Created:

                    <span className="ml-2 font-medium text-slate-700">
                      {formatDateTime(
                        booking.createdAt
                      )}
                    </span>
                  </p>

                  {booking.coach && (
                    <p className="text-slate-500">
                      Coach:

                      <span className="ml-2 font-medium text-slate-700">
                        {booking.coach}
                      </span>
                    </p>
                  )}

                  {booking.seats &&
                    booking.seats.length >
                      0 && (
                      <p className="text-slate-500">
                        Seat
                        {booking.seats.length >
                        1
                          ? "s"
                          : ""}
                        :

                        <span className="ml-2 font-medium text-slate-700">
                          {booking.seats.join(
                            ", "
                          )}
                        </span>
                      </p>
                    )}
                </div>
              </div>

              {/* Fare Summary */}
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Fare Summary
                </p>

                <div className="mt-4 space-y-3">
                  <FareRow
                    label="Base Fare"
                    amount={
                      booking.baseFare
                    }
                  />

                  <FareRow
                    label="Reservation Fee"
                    amount={
                      booking.reservationFee
                    }
                  />

                  <FareRow
                    label="GST"
                    amount={
                      booking.gst
                    }
                  />

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        Total Paid
                      </span>

                      <span className="text-lg font-black text-red-600">
                        {formatCurrency(
                          booking.totalAmount
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() =>
              window.print()
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download size={17} />
            Print / Save Ticket
          </button>

          <Link
            href="/bookings"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            <Ticket size={17} />
            View My Bookings
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Home size={17} />
            Back to Home
          </Link>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-red-600"
          >
            <ArrowLeft size={15} />
            Go to booking history
          </Link>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   STATION BLOCK
============================================================ */

function StationBlock({
  time,
  station,
  label,
  align = "left",
}: {
  time: string;
  station: string;
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
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-slate-900">
        {time}
      </p>

      <p className="mt-1 font-semibold text-slate-700">
        {station}
      </p>
    </div>
  );
}

/* ============================================================
   TICKET INFO
============================================================ */

function TicketInfo({
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
   FARE ROW
============================================================ */

function FareRow({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-800">
        {formatCurrency(amount)}
      </span>
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
    new Date(
      `${date}T00:00:00`
    );

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatDateTime(
  date: string
): string {
  const parsed =
    new Date(date);

  return parsed.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

function formatStatus(
  status: Booking["status"]
): string {
  const labels: Record<
    Booking["status"],
    string
  > = {
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
  };

  return labels[status];
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

/* ============================================================
   COACH
============================================================ */

function generateCoach(): string {
  const coaches = [
    "S1",
    "S2",
    "S3",
    "S4",
    "B1",
    "B2",
  ];

  return coaches[
    Math.floor(
      Math.random() *
        coaches.length
    )
  ];
}

/* ============================================================
   SEATS
============================================================ */

function generateSeats(
  count: number
): string[] {
  const start =
    Math.floor(
      Math.random() * 60
    ) + 1;

  return Array.from(
    {
      length: count,
    },
    (_, index) =>
      String(start + index)
  );
}