"use client";

import { Filter, RotateCcw, SlidersHorizontal } from "lucide-react";

export type SortOption =
  | "departure"
  | "duration"
  | "fare-low"
  | "fare-high";

interface TrainFiltersProps {
  selectedClasses: string[];
  selectedTime: string[];
  sortBy: SortOption;
  onClassChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onReset: () => void;
}

const classes = [
  { value: "1A", label: "First AC" },
  { value: "2A", label: "AC 2 Tier" },
  { value: "3A", label: "AC 3 Tier" },
  { value: "SL", label: "Sleeper" },
  { value: "CC", label: "Chair Car" },
  { value: "2S", label: "Second Sitting" },
];

const timeSlots = [
  { value: "morning", label: "Morning", time: "06:00 – 12:00" },
  { value: "afternoon", label: "Afternoon", time: "12:00 – 18:00" },
  { value: "evening", label: "Evening", time: "18:00 – 22:00" },
  { value: "night", label: "Night", time: "22:00 – 06:00" },
];

export default function TrainFilters({
  selectedClasses,
  selectedTime,
  sortBy,
  onClassChange,
  onTimeChange,
  onSortChange,
  onReset,
}: TrainFiltersProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div className="flex items-center gap-2">
          <Filter size={17} className="text-red-600" />

          <h2 className="font-bold text-slate-900">
            Filters
          </h2>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-600"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>

      {/* Class */}
      <div className="border-b border-slate-100 p-5">
        <h3 className="text-sm font-semibold text-slate-900">
          Travel Class
        </h3>

        <div className="mt-4 space-y-3">
          {classes.map((item) => (
            <label
              key={item.value}
              className="flex cursor-pointer items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(item.value)}
                  onChange={() =>
                    onClassChange(item.value)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-red-600 accent-red-600"
                />

                <span className="text-sm text-slate-600">
                  {item.value}
                </span>
              </div>

              <span className="text-xs text-slate-400">
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Departure */}
      <div className="border-b border-slate-100 p-5">
        <h3 className="text-sm font-semibold text-slate-900">
          Departure Time
        </h3>

        <div className="mt-4 space-y-3">
          {timeSlots.map((item) => (
            <label
              key={item.value}
              className="flex cursor-pointer items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedTime.includes(item.value)}
                  onChange={() =>
                    onTimeChange(item.value)
                  }
                  className="h-4 w-4 rounded border-slate-300 accent-red-600"
                />

                <span className="text-sm text-slate-600">
                  {item.label}
                </span>
              </div>

              <span className="text-[11px] text-slate-400">
                {item.time}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="p-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={16}
            className="text-slate-400"
          />

          <h3 className="text-sm font-semibold text-slate-900">
            Sort By
          </h3>
        </div>

        <select
          value={sortBy}
          onChange={(event) =>
            onSortChange(
              event.target.value as SortOption
            )
          }
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-red-500"
        >
          <option value="departure">
            Departure Time
          </option>

          <option value="duration">
            Shortest Duration
          </option>

          <option value="fare-low">
            Lowest Fare
          </option>

          <option value="fare-high">
            Highest Fare
          </option>
        </select>
      </div>
    </aside>
  );
}