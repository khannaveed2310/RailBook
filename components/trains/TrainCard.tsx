"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  IndianRupee,
  TrainFront,
} from "lucide-react";

import type { Train } from "@/types/train";
import { formatCurrency } from "@/lib/utils";

interface TrainCardProps {
  train: Train;
  journeyDate: string;
}

export default function TrainCard({
  train,
  journeyDate,
}: TrainCardProps) {
  const lowestFare = Math.min(
    ...train.classes.map((item) => item.fare)
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-red-200 hover:shadow-lg">
      {/* Header */}
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <TrainFront size={21} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-900">
                  {train.name}
                </h3>

                <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                  {train.number}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Runs{" "}
                {train.runsOn.length === 7
                  ? "Daily"
                  : train.runsOn.join(", ")}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 px-3 py-2 text-left sm:text-right">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Starting from
            </p>

            <p className="mt-0.5 font-bold text-slate-900">
              {formatCurrency(lowestFare)}
            </p>
          </div>
        </div>
      </div>

      {/* Journey */}
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Departure */}
          <div>
            <p className="text-xl font-bold text-slate-900 sm:text-2xl">
              {train.departure}
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-slate-700">
              {train.source}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              {journeyDate}
            </p>
          </div>

          {/* Duration */}
          <div className="flex min-w-[90px] flex-col items-center">
            <span className="text-xs font-medium text-slate-400">
              {train.duration}
            </span>

            <div className="my-2 flex w-full items-center">
              <div className="h-px flex-1 bg-slate-200" />

              <div className="mx-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600">
                <ArrowRight size={14} />
              </div>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock3 size={12} />
              Journey
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <p className="text-xl font-bold text-slate-900 sm:text-2xl">
              {train.arrival}
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-slate-700">
              {train.destination}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              Next day
            </p>
          </div>
        </div>
      </div>

      {/* Classes */}
      <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {train.classes.map((trainClass) => {
            const available = trainClass.available > 0;

            return (
              <div
                key={trainClass.code}
                className={`rounded-xl border p-3 ${
                  available
                    ? "border-slate-200 bg-white"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    {trainClass.code}
                  </span>

                  <span className="text-xs text-slate-400">
                    {trainClass.name}
                  </span>
                </div>

                <div className="mt-3 flex items-end justify-between gap-2">
                  <div className="flex items-center text-sm font-bold text-slate-900">
                    <IndianRupee size={13} />
                    {trainClass.fare}
                  </div>

                  <span
                    className={`text-[11px] font-semibold ${
                      available
                        ? trainClass.available <= 10
                          ? "text-amber-600"
                          : "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {available
                      ? `${trainClass.available} available`
                      : "Not available"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            Fare shown is approximate and for simulation only.
          </p>

          <Link
            href={`/trains/${train.id}?date=${journeyDate}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Check Availability
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}