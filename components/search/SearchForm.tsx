"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeftRight,
  CalendarDays,
  Search,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  getAllStations,
} from "@/lib/mockApi";

import type { Station } from "@/data/stations";

import StationSelector from "./StationSelector";

interface SearchFormProps {
  initialSource?: string;
  initialDestination?: string;
  initialDate?: string;
}

function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function SearchForm({
  initialSource,
  initialDestination,
  initialDate,
}: SearchFormProps) {
  const router = useRouter();

  const [stations, setStations] =
    useState<Station[]>([]);

  const [from, setFrom] =
    useState<Station | null>(null);

  const [to, setTo] =
    useState<Station | null>(null);

  const today = getTodayDate();

  const [date, setDate] =
    useState(
      initialDate || today
    );

  const [error, setError] =
    useState("");

  /**
   * Load static + admin-created stations
   */
  useEffect(() => {
    const allStations =
      getAllStations();

    setStations(allStations);

    function findStation(
      value?: string
    ): Station | null {
      if (!value) {
        return null;
      }

      const normalized =
        value.trim().toLowerCase();

      return (
        allStations.find(
          (station) =>
            station.city
              .trim()
              .toLowerCase() ===
              normalized ||
            station.name
              .trim()
              .toLowerCase() ===
              normalized ||
            station.code
              .trim()
              .toLowerCase() ===
              normalized
        ) ?? null
      );
    }

    const defaultFrom =
      allStations.find(
        (station) =>
          station.code === "CSMT"
      ) ??
      allStations[0] ??
      null;

    const defaultTo =
      allStations.find(
        (station) =>
          station.code === "NDLS"
      ) ??
      allStations[1] ??
      null;

    setFrom(
      findStation(initialSource) ??
        defaultFrom
    );

    setTo(
      findStation(initialDestination) ??
        defaultTo
    );
  }, [
    initialSource,
    initialDestination,
  ]);

  function swapStations() {
    setFrom(to);
    setTo(from);
    setError("");
  }

  function handleSearch() {
    setError("");

    if (!from || !to) {
      setError(
        "Please select both source and destination."
      );
      return;
    }

    if (
      from.city.toLowerCase() ===
      to.city.toLowerCase()
    ) {
      setError(
        "Source and destination cannot be the same."
      );
      return;
    }

    if (!date) {
      setError(
        "Please select a journey date."
      );
      return;
    }

    const params =
      new URLSearchParams({
        from: from.city,
        to: to.city,
        date,
      });

    router.push(
      `/search?${params.toString()}`
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_220px_auto]">

        {/* FROM */}
        <StationSelector
          label="From"
          value={from}
          stations={stations}
          excludeStation={to?.code}
          onChange={setFrom}
        />

        {/* TO */}
        <div className="relative">
          <StationSelector
            label="To"
            value={to}
            stations={stations}
            excludeStation={from?.code}
            onChange={setTo}
          />

          <button
            type="button"
            onClick={swapStations}
            className="absolute -right-5 top-9 z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-red-200 hover:text-red-600 lg:flex"
            aria-label="Swap stations"
          >
            <ArrowLeftRight
              size={17}
            />
          </button>
        </div>

        {/* DATE */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Journey Date
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
            <CalendarDays
              size={19}
              className="shrink-0 text-red-600"
            />

            <input
              type="date"
              value={date}
              min={today}
              onChange={(event) =>
                setDate(
                  event.target.value
                )
              }
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
            />
          </div>
        </div>

        {/* SEARCH */}
        <button
          type="button"
          onClick={handleSearch}
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98] lg:mt-6"
        >
          <Search size={18} />
          Search Trains
        </button>
      </div>

      <div className="mt-3 flex justify-center lg:hidden">
        <button
          type="button"
          onClick={swapStations}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          <ArrowLeftRight
            size={15}
          />
          Swap stations
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}