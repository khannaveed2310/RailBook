"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  Smartphone,
  TrainFront,
  WalletCards,
} from "lucide-react";

import {
  useForm,
} from "react-hook-form";

import { z } from "zod";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  getSessionStorage,
  BOOKING_PASSENGERS_KEY,
  BOOKING_SELECTION_KEY,
} from "@/lib/storage";

import {
  calculateFare,
  formatCurrency,
} from "@/lib/utils";

import {
  getTrainById,
} from "@/lib/mockApi";

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
   TYPES
============================================================ */

type PaymentMethod =
  | "UPI"
  | "DEBIT_CARD"
  | "CREDIT_CARD";

/* ============================================================
   VALIDATION
============================================================ */

const cardSchema = z.object({
  cardNumber: z
    .string()
    .transform((value) =>
      value.replace(/\s/g, "")
    )
    .refine(
      (value) =>
        /^\d{16}$/.test(value),
      "Enter a valid 16-digit card number"
    ),

  cardName: z
    .string()
    .trim()
    .min(
      2,
      "Enter the name on the card"
    ),

  expiry: z
    .string()
    .regex(
      /^(0[1-9]|1[0-2])\/\d{2}$/,
      "Use MM/YY format"
    ),

  cvv: z
    .string()
    .regex(
      /^\d{3}$/,
      "Enter a valid 3-digit CVV"
    ),
});

const upiSchema = z.object({
  upiId: z
    .string()
    .trim()
    .regex(
      /^[\w.-]+@[\w.-]+$/,
      "Enter a valid UPI ID"
    ),
});

type CardFormValues =
  z.infer<typeof cardSchema>;

type UpiFormValues =
  z.infer<typeof upiSchema>;

/* ============================================================
   PAGE
============================================================ */

export default function PaymentPage() {
  const router = useRouter();

  const [
    selection,
    setSelection,
  ] =
    useState<BookingSelection | null>(
      null
    );

  const [
    passengers,
    setPassengers,
  ] = useState<Passenger[]>([]);

  const [
    train,
    setTrain,
  ] = useState<Train | null>(
    null
  );

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PaymentMethod>(
      "UPI"
    );

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    paymentError,
    setPaymentError,
  ] = useState("");

  const cardForm =
    useForm<CardFormValues>({
      resolver:
        zodResolver(cardSchema),
      defaultValues: {
        cardNumber: "",
        cardName: "",
        expiry: "",
        cvv: "",
      },
    });

  const upiForm =
    useForm<UpiFormValues>({
      resolver:
        zodResolver(upiSchema),
      defaultValues: {
        upiId: "",
      },
    });

  /* ==========================================================
     LOAD BOOKING
  ========================================================== */

  useEffect(() => {
    async function loadBooking() {
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
          "Failed to load payment data:",
          error
        );

        router.replace("/");
      }
    }

    loadBooking();
  }, [router]);

  /* ==========================================================
     PAYMENT
  ========================================================== */

  async function processPayment() {
    setPaymentError("");
    setProcessing(true);

    /*
     * Simulate payment gateway delay.
     */
    await new Promise(
      (resolve) =>
        setTimeout(resolve, 1800)
    );

    /*
     * Store payment information temporarily.
     * We don't store sensitive card details.
     */
    sessionStorage.setItem(
      "railbook_payment_status",
      "SUCCESS"
    );

    sessionStorage.setItem(
      "railbook_payment_method",
      paymentMethod
    );

    setProcessing(false);

    router.push(
      "/booking/confirmation"
    );
  }

  function handleUpiSubmit(
    values: UpiFormValues
  ) {
    console.log(
      "Mock UPI payment:",
      values.upiId
    );

    processPayment();
  }

  function handleCardSubmit(
    values: CardFormValues
  ) {
    console.log(
      "Mock card payment:",
      {
        cardNumber:
          `**** **** **** ${values.cardNumber.slice(
            -4
          )}`,
        cardName:
          values.cardName,
      }
    );

    processPayment();
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
            Preparing secure payment...
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          HEADER
      ===================================================== */}

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

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <LockKeyhole
              size={14}
              className="text-green-600"
            />
            Secure Checkout
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-red-600">
            STEP 4 OF 5
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Complete your payment
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Select a payment method and complete
            this simulated transaction.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* =================================================
              PAYMENT AREA
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Payment header */}
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="font-bold text-slate-900">
                Payment Method
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Choose how you want to simulate
                the payment.
              </p>
            </div>

            <div className="p-5 sm:p-6">
              {/* Methods */}
              <div className="grid gap-3 sm:grid-cols-3">
                <PaymentMethodButton
                  active={
                    paymentMethod ===
                    "UPI"
                  }
                  icon={
                    <Smartphone
                      size={19}
                    />
                  }
                  title="UPI"
                  description="GPay, PhonePe, etc."
                  onClick={() =>
                    setPaymentMethod(
                      "UPI"
                    )
                  }
                />

                <PaymentMethodButton
                  active={
                    paymentMethod ===
                    "DEBIT_CARD"
                  }
                  icon={
                    <CreditCard
                      size={19}
                    />
                  }
                  title="Debit Card"
                  description="Visa, Mastercard"
                  onClick={() =>
                    setPaymentMethod(
                      "DEBIT_CARD"
                    )
                  }
                />

                <PaymentMethodButton
                  active={
                    paymentMethod ===
                    "CREDIT_CARD"
                  }
                  icon={
                    <WalletCards
                      size={19}
                    />
                  }
                  title="Credit Card"
                  description="Visa, Mastercard"
                  onClick={() =>
                    setPaymentMethod(
                      "CREDIT_CARD"
                    )
                  }
                />
              </div>

              {/* =================================================
                  UPI FORM
              ================================================= */}

              {paymentMethod ===
                "UPI" && (
                <form
                  onSubmit={upiForm.handleSubmit(
                    handleUpiSubmit
                  )}
                  className="mt-8"
                >
                  <div className="max-w-md">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      UPI ID
                    </label>

                    <input
                      type="text"
                      {...upiForm.register(
                        "upiId"
                      )}
                      placeholder="example@upi"
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
                        upiForm.formState
                          .errors.upiId
                          ? "border-red-400"
                          : "border-slate-200"
                      }`}
                    />

                    {upiForm.formState
                      .errors.upiId && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {
                          upiForm
                            .formState
                            .errors
                            .upiId
                            ?.message
                        }
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-400">
                      Example:
                      naveed@upi
                    </p>
                  </div>

                  <PaymentButton
                    processing={
                      processing
                    }
                  />
                </form>
              )}

              {/* =================================================
                  CARD FORM
              ================================================= */}

              {(paymentMethod ===
                "DEBIT_CARD" ||
                paymentMethod ===
                  "CREDIT_CARD") && (
                <form
                  onSubmit={cardForm.handleSubmit(
                    handleCardSubmit
                  )}
                  className="mt-8 space-y-5"
                >
                  {/* Card Number */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Card Number
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={19}
                      {...cardForm.register(
                        "cardNumber"
                      )}
                      placeholder="1234 5678 9012 3456"
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
                        cardForm.formState
                          .errors
                          .cardNumber
                          ? "border-red-400"
                          : "border-slate-200"
                      }`}
                    />

                    {cardForm.formState
                      .errors
                      .cardNumber && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {
                          cardForm
                            .formState
                            .errors
                            .cardNumber
                            ?.message
                        }
                      </p>
                    )}
                  </div>

                  {/* Card Name */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Name on Card
                    </label>

                    <input
                      type="text"
                      {...cardForm.register(
                        "cardName"
                      )}
                      placeholder="MOHD NAVEED KHAN"
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-sm uppercase outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
                        cardForm.formState
                          .errors
                          .cardName
                          ? "border-red-400"
                          : "border-slate-200"
                      }`}
                    />

                    {cardForm.formState
                      .errors.cardName && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {
                          cardForm
                            .formState
                            .errors
                            .cardName
                            ?.message
                        }
                      </p>
                    )}
                  </div>

                  {/* Expiry + CVV */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Expiry
                      </label>

                      <input
                        type="text"
                        maxLength={5}
                        {...cardForm.register(
                          "expiry"
                        )}
                        placeholder="MM/YY"
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
                          cardForm.formState
                            .errors.expiry
                            ? "border-red-400"
                            : "border-slate-200"
                        }`}
                      />

                      {cardForm.formState
                        .errors.expiry && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {
                            cardForm
                              .formState
                              .errors
                              .expiry
                              ?.message
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        CVV
                      </label>

                      <input
                        type="password"
                        maxLength={3}
                        inputMode="numeric"
                        {...cardForm.register(
                          "cvv"
                        )}
                        placeholder="•••"
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
                          cardForm.formState
                            .errors.cvv
                            ? "border-red-400"
                            : "border-slate-200"
                        }`}
                      />

                      {cardForm.formState
                        .errors.cvv && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {
                            cardForm
                              .formState
                              .errors
                              .cvv
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <PaymentButton
                    processing={
                      processing
                    }
                  />
                </form>
              )}

              {/* Demo notice */}
              <div className="mt-6 flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
                <LockKeyhole
                  size={17}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Mock Payment Gateway
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    This payment is simulated for
                    the frontend assessment. No real
                    money or payment gateway is used.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <aside>
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-slate-950 px-5 py-4">
                <h2 className="font-bold text-white">
                  Booking Summary
                </h2>
              </div>

              <div className="space-y-5 p-5">
                {/* Train */}
                <div>
                  <div className="flex items-center gap-2">
                    <TrainFront
                      size={17}
                      className="text-red-600"
                    />

                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Train
                    </p>
                  </div>

                  <p className="mt-2 font-bold text-slate-900">
                    {train.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {train.number}
                  </p>
                </div>

                {/* Route */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Journey
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {train.source}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {train.departure}
                      </p>
                    </div>

                    <ArrowRight
                      size={15}
                      className="text-slate-300"
                    />

                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {train.destination}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {train.arrival}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Passengers */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Passengers
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {passengers.length} passenger
                    {passengers.length >
                    1
                      ? "s"
                      : ""}
                  </p>
                </div>

                {/* Fare */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="space-y-3">
                    <SummaryRow
                      label="Base Fare"
                      amount={
                        fare.baseFare
                      }
                    />

                    <SummaryRow
                      label="Reservation Fee"
                      amount={
                        fare.reservationFee
                      }
                    />

                    <SummaryRow
                      label="GST"
                      amount={fare.gst}
                    />
                  </div>

                  <div className="mt-4 border-t border-dashed border-slate-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        Total
                      </span>

                      <span className="text-xl font-bold text-red-600">
                        {formatCurrency(
                          fare.totalAmount
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Back */}
        <div className="mt-6">
          <Link
            href="/booking/review"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-red-600"
          >
            <ArrowLeft size={16} />
            Back to booking review
          </Link>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   PAYMENT METHOD BUTTON
============================================================ */

function PaymentMethodButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? "border-red-500 bg-red-50 ring-2 ring-red-100"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          active
            ? "bg-red-600 text-white"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </div>

      <p className="mt-3 text-sm font-bold text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-[11px] text-slate-500">
        {description}
      </p>
    </button>
  );
}

/* ============================================================
   PAYMENT BUTTON
============================================================ */

function PaymentButton({
  processing,
}: {
  processing: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={processing}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {processing ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Processing Payment...
        </>
      ) : (
        <>
          Pay Securely
          <ArrowRight size={17} />
        </>
      )}
    </button>
  );
}

/* ============================================================
   SUMMARY ROW
============================================================ */

function SummaryRow({
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