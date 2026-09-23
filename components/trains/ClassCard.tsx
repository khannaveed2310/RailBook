"use client";

import {
  Check,
  IndianRupee,
  Users,
} from "lucide-react";

import type { TrainClass } from "@/types/train";

interface ClassCardProps {
  trainClass: TrainClass;
  selected: boolean;
  onSelect: () => void;
}

export default function ClassCard({
  trainClass,
  selected,
  onSelect,
}: ClassCardProps) {
  const available = trainClass.available > 0;
  const limited =
    trainClass.available > 0 &&
    trainClass.available <= 10;

  return (
    <button
      type="button"
      disabled={!available}
      onClick={onSelect}
      className={`relative w-full rounded-2xl border p-5 text-left transition ${
        selected
          ? "border-red-500 bg-red-50/50 ring-2 ring-red-100"
          : available
            ? "border-slate-200 bg-white hover:border-red-200 hover:shadow-md"
            : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
      }`}
    >
      {selected && (
        <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white">
          <Check size={14} />
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-bold text-slate-900">
            {trainClass.code}
          </div>

          <div className="mt-1 text-sm text-slate-500">
            {trainClass.name}
          </div>
        </div>

        <div className="flex items-center font-bold text-slate-900">
          <IndianRupee size={15} />
          {trainClass.fare}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <Users
            size={15}
            className={
              limited
                ? "text-amber-500"
                : available
                  ? "text-emerald-500"
                  : "text-slate-400"
            }
          />

          <span
            className={`text-xs font-semibold ${
              limited
                ? "text-amber-600"
                : available
                  ? "text-emerald-600"
                  : "text-slate-400"
            }`}
          >
            {available
              ? `${trainClass.available} seats available`
              : "Not available"}
          </span>
        </div>

        <span className="text-xs font-semibold text-slate-400">
          {selected ? "Selected" : "Select"}
        </span>
      </div>
    </button>
  );
}