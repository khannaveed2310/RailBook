"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Plus,
  Trash2,
  UserRound,
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
  setSessionStorage,
  BOOKING_PASSENGERS_KEY,
} from "@/lib/storage";

import {
  generateId,
} from "@/lib/utils";

import type {
  Passenger,
} from "@/types/passenger";

/* ============================================================
   VALIDATION
============================================================ */

const passengerSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Passenger name must be at least 2 characters"
      ),

    age: z.coerce
      .number()
      .int()
      .min(
        1,
        "Age must be at least 1"
      )
      .max(
        120,
        "Please enter a valid age"
      ),

    gender: z.enum([
      "MALE",
      "FEMALE",
      "OTHER",
    ]),

    berthPreference: z.enum([
      "LOWER",
      "MIDDLE",
      "UPPER",
      "SIDE_LOWER",
      "SIDE_UPPER",
      "NO_PREFERENCE",
    ]),
  });

type PassengerFormValues =
  z.infer<typeof passengerSchema>;

type PassengerFormInput =
  z.input<typeof passengerSchema>;

/* ============================================================
   COMPONENT
============================================================ */

export default function PassengerDetails() {
  const router = useRouter();

  const [
    passengers,
    setPassengers,
  ] = useState<Passenger[]>([]);

  const [
    editingId,
    setEditingId,
  ] = useState<string | null>(
    null
  );

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<
    PassengerFormInput,
    any,
    PassengerFormValues
  >({
    resolver:
      zodResolver(
        passengerSchema
      ),

    defaultValues: {
      name: "",
      age: undefined,
      gender: "MALE",
      berthPreference:
        "NO_PREFERENCE",
    },
  });

  /* ==========================================================
     LOAD EXISTING PASSENGERS
  ========================================================== */

  useEffect(() => {
    const storedPassengers =
      getSessionStorage<Passenger[]>(
        BOOKING_PASSENGERS_KEY,
        []
      );

    setPassengers(
      storedPassengers
    );
  }, []);

  /* ==========================================================
     SAVE PASSENGER
  ========================================================== */

  function onSubmit(
    values: PassengerFormValues
  ) {
    setSubmitError("");

    try {
      if (editingId) {
        const updatedPassengers =
          passengers.map(
            (passenger) =>
              passenger.id ===
              editingId
                ? {
                    ...passenger,
                    name: values.name.trim(),
                    age: values.age,
                    gender: values.gender,
                    berthPreference:
                      values.berthPreference,
                  }
                : passenger
          );

        setPassengers(
          updatedPassengers
        );

        setSessionStorage(
          BOOKING_PASSENGERS_KEY,
          updatedPassengers
        );

        setEditingId(null);
      } else {
        if (
          passengers.length >= 6
        ) {
          setSubmitError(
            "You can add a maximum of 6 passengers."
          );
          return;
        }

        const newPassenger: Passenger =
          {
            id: generateId(
              "passenger"
            ),
            name: values.name.trim(),
            age: values.age,
            gender: values.gender,
            berthPreference:
              values.berthPreference,
          };

        const updatedPassengers =
          [
            ...passengers,
            newPassenger,
          ];

        setPassengers(
          updatedPassengers
        );

        setSessionStorage(
          BOOKING_PASSENGERS_KEY,
          updatedPassengers
        );
      }

      reset({
        name: "",
        age: undefined,
        gender: "MALE",
        berthPreference:
          "NO_PREFERENCE",
      });
    } catch (error) {
      console.error(
        "Failed to save passenger:",
        error
      );

      setSubmitError(
        "Unable to save passenger. Please try again."
      );
    }
  }

  /* ==========================================================
     EDIT
  ========================================================== */

  function handleEdit(
    passenger: Passenger
  ) {
    setEditingId(
      passenger.id
    );

    reset({
      name: passenger.name,
      age: passenger.age,
      gender: passenger.gender,
      berthPreference:
        passenger.berthPreference,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* ==========================================================
     DELETE
  ========================================================== */

  function handleDelete(
    passengerId: string
  ) {
    const updatedPassengers =
      passengers.filter(
        (passenger) =>
          passenger.id !==
          passengerId
      );

    setPassengers(
      updatedPassengers
    );

    setSessionStorage(
      BOOKING_PASSENGERS_KEY,
      updatedPassengers
    );

    if (
      editingId ===
      passengerId
    ) {
      setEditingId(null);

      reset({
        name: "",
        age: undefined,
        gender: "MALE",
        berthPreference:
          "NO_PREFERENCE",
      });
    }
  }

  /* ==========================================================
     CANCEL EDIT
  ========================================================== */

  function handleCancelEdit() {
    setEditingId(null);

    reset({
      name: "",
      age: undefined,
      gender: "MALE",
      berthPreference:
        "NO_PREFERENCE",
    });
  }

  /* ==========================================================
     CONTINUE
  ========================================================== */

  function handleContinue() {
    setSubmitError("");

    if (
      passengers.length === 0
    ) {
      setSubmitError(
        "Please add at least one passenger before continuing."
      );
      return;
    }

    router.push(
      "/booking/review"
    );
  }

  return (
    <div className="space-y-6">
      {/* =====================================================
          PASSENGER FORM
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <UserRound
                size={19}
              />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Passenger Details
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Add passenger information for
                this journey.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="p-5 sm:p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Full Name
              </label>

              <input
                type="text"
                {...register("name")}
                placeholder="Enter passenger full name"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
                  errors.name
                    ? "border-red-400"
                    : "border-slate-200"
                }`}
              />

              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500">
                  {
                    errors.name
                      .message
                  }
                </p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Age
              </label>

              <input
                type="number"
                min="1"
                max="120"
                {...register("age")}
                placeholder="Enter age"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
                  errors.age
                    ? "border-red-400"
                    : "border-slate-200"
                }`}
              />

              {errors.age && (
                <p className="mt-1.5 text-xs text-red-500">
                  {
                    errors.age
                      .message
                  }
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Gender
              </label>

              <select
                {...register(
                  "gender"
                )}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                <option value="MALE">
                  Male
                </option>

                <option value="FEMALE">
                  Female
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>

            {/* Berth */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Berth Preference
              </label>

              <select
                {...register(
                  "berthPreference"
                )}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                <option value="NO_PREFERENCE">
                  No Preference
                </option>

                <option value="LOWER">
                  Lower
                </option>

                <option value="MIDDLE">
                  Middle
                </option>

                <option value="UPPER">
                  Upper
                </option>

                <option value="SIDE_LOWER">
                  Side Lower
                </option>

                <option value="SIDE_UPPER">
                  Side Upper
                </option>
              </select>
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            {editingId && (
              <button
                type="button"
                onClick={
                  handleCancelEdit
                }
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel Edit
              </button>
            )}

            <button
              type="submit"
              disabled={
                isSubmitting ||
                (!editingId &&
                  passengers.length >=
                    6)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editingId ? (
                "Update Passenger"
              ) : (
                <>
                  <Plus size={17} />
                  Add Passenger
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* =====================================================
          PASSENGER LIST
      ===================================================== */}

      {passengers.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-900">
                Added Passengers
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {passengers.length} of 6
                passengers added
              </p>
            </div>

            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
              {passengers.length}/6
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {passengers.map(
              (
                passenger,
                index
              ) => (
                <PassengerRow
                  key={
                    passenger.id
                  }
                  passenger={
                    passenger
                  }
                  index={index}
                  onEdit={
                    handleEdit
                  }
                  onDelete={
                    handleDelete
                  }
                />
              )
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          CONTINUE
      ===================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-slate-400">
          You can add up to 6 passengers
          for this booking.
        </p>

        <button
          type="button"
          onClick={
            handleContinue
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Continue to Review
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   PASSENGER ROW
============================================================ */

function PassengerRow({
  passenger,
  index,
  onEdit,
  onDelete,
}: {
  passenger: Passenger;
  index: number;
  onEdit: (
    passenger: Passenger
  ) => void;
  onDelete: (
    id: string
  ) => void;
}) {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Number */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 font-bold text-red-600">
          {index + 1}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">
            {passenger.name}
          </h3>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>
              Age: {passenger.age}
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

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onEdit(
                passenger
              )
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:text-red-600"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(
                passenger.id
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${passenger.name}`}
          >
            <Trash2
              size={15}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

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