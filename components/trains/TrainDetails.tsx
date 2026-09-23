"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";

import type { Train, Quota } from "@/types/train";
import type { BookingSelection } from "@/types/booking";

import ClassCard from "./ClassCard";
import QuotaSelector from "./QuotaSelector";

import {
  BOOKING_SELECTION_KEY,
  setSessionStorage,
} from "@/lib/storage";

interface TrainDetailsProps {
  train: Train;
  journeyDate: string;
}

export default function TrainDetails({
  train,
  journeyDate,
}: TrainDetailsProps) {
  const router = useRouter();

  const [selectedClass, setSelectedClass] =
    useState<Train["classes"][number] | null>(null);

  const [quota, setQuota] =
    useState<Quota>("GENERAL");

  const [error, setError] = useState("");

  function handleContinue() {
    setError("");

    if (!selectedClass) {
      setError("Please select a travel class.");
      return;
    }

    const selection: BookingSelection = {
      trainId: train.id,
      journeyDate,
      travelClass: selectedClass.code,
      quota,
      fare: selectedClass.fare,
    };

    setSessionStorage(
      BOOKING_SELECTION_KEY,
      selection
    );

    router.push("/booking/passenger");
  }

  return (
    <div className="space-y-6">
      {/* Train information */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {train.name}
                </h1>

                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                  {train.number}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays size={15} />

                {formatDate(journeyDate)}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Seats available
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div>
              <div className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {train.departure}
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-700">
                {train.source}
              </div>
            </div>

            <div className="flex min-w-[100px] flex-col items-center">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock3 size={13} />
                {train.duration}
              </div>

              <div className="my-3 flex w-full items-center">
                <div className="h-px flex-1 bg-slate-200" />

                <div className="mx-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <ArrowRight size={15} />
                </div>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <span className="text-[11px] text-slate-400">
                Direct journey
              </span>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {train.arrival}
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-700">
                {train.destination}
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Next day
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Class selection */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Select Travel Class
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose the class you want to travel in.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {train.classes.map((trainClass) => (
            <ClassCard
              key={trainClass.code}
              trainClass={trainClass}
              selected={
                selectedClass?.code === trainClass.code
              }
              onSelect={() =>
                setSelectedClass(trainClass)
              }
            />
          ))}
        </div>
      </section>

      {/* Quota */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Select Quota
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose the booking quota for this journey.
          </p>
        </div>

        <div className="mt-5">
          <QuotaSelector
            value={quota}
            onChange={setQuota}
          />
        </div>
      </section>

      {/* Bottom summary */}
      <section className="sticky bottom-3 z-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-slate-400">
              Selected class
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="font-bold text-slate-900">
                {selectedClass?.code ?? "Not selected"}
              </span>

              {selectedClass && (
                <>
                  <span className="text-slate-300">
                    •
                  </span>

                  <span className="text-sm text-slate-500">
                    ₹{selectedClass.fare}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Continue to Passenger Details
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}
      </section>
    </div>
  );
}

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  return parsedDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}