"use client";

import { useMemo, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";

import type { Train } from "@/types/train";
import TrainCard from "./TrainCard";
import TrainFilters, {
  type SortOption,
} from "./TrainFilters";

interface TrainSearchResultsProps {
  trains: Train[];
  journeyDate: string;
}

export default function TrainSearchResults({
  trains,
  journeyDate,
}: TrainSearchResultsProps) {
  const [selectedClasses, setSelectedClasses] =
    useState<string[]>([]);

  const [selectedTime, setSelectedTime] =
    useState<string[]>([]);

  const [sortBy, setSortBy] =
    useState<SortOption>("departure");

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  function toggleClass(value: string) {
    setSelectedClasses((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function toggleTime(value: string) {
    setSelectedTime((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function resetFilters() {
    setSelectedClasses([]);
    setSelectedTime([]);
    setSortBy("departure");
  }

  const filteredTrains = useMemo(() => {
    let result = [...trains];

    // Class filter
    if (selectedClasses.length > 0) {
      result = result.filter((train) =>
        train.classes.some((trainClass) =>
          selectedClasses.includes(trainClass.code)
        )
      );
    }

    // Time filter
    if (selectedTime.length > 0) {
      result = result.filter((train) => {
        const hour = Number(
          train.departure.split(":")[0]
        );

        return selectedTime.some((time) => {
          if (time === "morning") {
            return hour >= 6 && hour < 12;
          }

          if (time === "afternoon") {
            return hour >= 12 && hour < 18;
          }

          if (time === "evening") {
            return hour >= 18 && hour < 22;
          }

          return hour >= 22 || hour < 6;
        });
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "departure") {
        return a.departure.localeCompare(b.departure);
      }

      if (sortBy === "duration") {
        return parseDuration(a.duration) -
          parseDuration(b.duration);
      }

      const fareA = Math.min(
        ...a.classes.map((item) => item.fare)
      );

      const fareB = Math.min(
        ...b.classes.map((item) => item.fare)
      );

      if (sortBy === "fare-low") {
        return fareA - fareB;
      }

      return fareB - fareA;
    });

    return result;
  }, [
    trains,
    selectedClasses,
    selectedTime,
    sortBy,
  ]);

  return (
    <>
      {/* Mobile filter button */}
      <div className="mb-5 flex items-center justify-between lg:hidden">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900">
            {filteredTrains.length}
          </span>{" "}
          trains found
        </p>

        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          <Filter size={16} />
          Filters
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Desktop Filters */}
        <div className="hidden lg:block">
          <TrainFilters
            selectedClasses={selectedClasses}
            selectedTime={selectedTime}
            sortBy={sortBy}
            onClassChange={toggleClass}
            onTimeChange={toggleTime}
            onSortChange={setSortBy}
            onReset={resetFilters}
          />
        </div>

        {/* Results */}
        <div>
          <div className="mb-5 hidden items-center justify-between lg:flex">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Available Trains
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredTrains.length} trains found
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <SlidersHorizontal size={15} />
              Sorted by{" "}
              <span className="font-semibold text-slate-700">
                {getSortLabel(sortBy)}
              </span>
            </div>
          </div>

          {filteredTrains.length > 0 ? (
            <div className="space-y-4">
              {filteredTrains.map((train) => (
                <TrainCard
                  key={train.id}
                  train={train}
                  journeyDate={journeyDate}
                />
              ))}
            </div>
          ) : (
            <EmptyResults onReset={resetFilters} />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setMobileFiltersOpen(false)}
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between px-1">
              <h2 className="font-bold text-slate-900">
                Filter Trains
              </h2>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600"
              >
                Done
              </button>
            </div>

            <TrainFilters
              selectedClasses={selectedClasses}
              selectedTime={selectedTime}
              sortBy={sortBy}
              onClassChange={toggleClass}
              onTimeChange={toggleTime}
              onSortChange={setSortBy}
              onReset={resetFilters}
            />
          </div>
        </div>
      )}
    </>
  );
}

function EmptyResults({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Filter size={23} />
      </div>

      <h3 className="mt-5 font-bold text-slate-900">
        No trains match your filters
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Try removing some filters to see more available
        trains.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
      >
        Reset Filters
      </button>
    </div>
  );
}

function parseDuration(duration: string) {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)m/);

  const hours = hoursMatch
    ? Number(hoursMatch[1])
    : 0;

  const minutes = minutesMatch
    ? Number(minutesMatch[1])
    : 0;

  return hours * 60 + minutes;
}

function getSortLabel(sort: SortOption) {
  switch (sort) {
    case "duration":
      return "Shortest Duration";

    case "fare-low":
      return "Lowest Fare";

    case "fare-high":
      return "Highest Fare";

    default:
      return "Departure Time";
  }
}