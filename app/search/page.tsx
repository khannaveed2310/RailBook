"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Search,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import SearchForm from "@/components/search/SearchForm";
import TrainSearchResults from "@/components/trains/TrainSearchResults";

import { searchTrains } from "@/lib/mockApi";

import type { Train } from "@/types/train";

import { Suspense } from "react";

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();

  const source = searchParams.get("from") || "";
  const destination = searchParams.get("to") || "";
  const journeyDate = searchParams.get("date") || "";

  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTrains() {
      if (!source || !destination) {
        setTrains([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");



        const results = await searchTrains(
          source,
          destination
        );



        setTrains(results);
      } catch (error) {
        console.error(
          "Train search failed:",
          error
        );

        setError(
          "Unable to search trains. Please try again."
        );

        setTrains([]);
      } finally {
        setLoading(false);
      }
    }

    loadTrains();
  }, [
    source,
    destination,
    journeyDate,
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* =====================================================
          SEARCH HEADER
      ====================================================== */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-red-600"
          >
            <ArrowLeft size={15} />
            Back to search
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {source || "—"}

                <span className="mx-2 text-red-500">
                  →
                </span>

                {destination || "—"}
              </h1>

              {journeyDate && (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={15} />

                  {formatJourneyDate(
                    journeyDate
                  )}
                </div>
              )}
            </div>

            {!loading && !error && (
              <span className="inline-flex w-fit rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                {trains.length}{" "}
                {trains.length === 1
                  ? "train"
                  : "trains"}{" "}
                available
              </span>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          SEARCH FORM
      ====================================================== */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <SearchForm
            initialSource={source}
            initialDestination={destination}
            initialDate={journeyDate}
          />
        </div>
      </section>

      {/* =====================================================
          RESULTS
      ====================================================== */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : trains.length === 0 ? (
          <EmptyState
            source={source}
            destination={destination}
          />
        ) : (
          <TrainSearchResults
            trains={trains}
            journeyDate={journeyDate}
          />
        )}
      </main>
    </div>
  );
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatJourneyDate(
  value: string
): string {
  if (!value) {
    return "";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <div className="text-center">
        <Loader2
          size={28}
          className="mx-auto animate-spin text-red-600"
        />

        <p className="mt-4 text-sm font-semibold text-slate-700">
          Searching available trains...
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Checking mock and admin-created routes
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <Search size={20} />
      </div>

      <h2 className="mt-4 text-lg font-bold text-slate-900">
        Search failed
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  source,
  destination,
}: {
  source: string;
  destination: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Search size={23} />
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-900">
        No trains found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        No train is available from{" "}
        <strong>{source}</strong> to{" "}
        <strong>{destination}</strong>.
      </p>

      <Link
        href="/"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        <Search size={15} />
        Search Again
      </Link>
    </div>
  );
}