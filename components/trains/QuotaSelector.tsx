"use client";

import {
  Check,
  Crown,
  Heart,
  ShieldCheck,
  Users,
} from "lucide-react";

import type { Quota } from "@/types/train";

interface QuotaSelectorProps {
  value: Quota;
  onChange: (quota: Quota) => void;
}

const quotas: {
  value: Quota;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "GENERAL",
    label: "General",
    description: "Regular booking",
    icon: <Users size={17} />,
  },
  {
    value: "TATKAL",
    label: "Tatkal",
    description: "Last-minute booking",
    icon: <Crown size={17} />,
  },
  {
    value: "LADIES",
    label: "Ladies",
    description: "Women passengers",
    icon: <Heart size={17} />,
  },
  {
    value: "SENIOR_CITIZEN",
    label: "Senior Citizen",
    description: "Eligible passengers",
    icon: <ShieldCheck size={17} />,
  },
];

export default function QuotaSelector({
  value,
  onChange,
}: QuotaSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {quotas.map((quota) => {
        const selected = value === quota.value;

        return (
          <button
            key={quota.value}
            type="button"
            onClick={() => onChange(quota.value)}
            className={`relative flex items-center gap-3 rounded-xl border p-4 text-left transition ${
              selected
                ? "border-red-500 bg-red-50"
                : "border-slate-200 bg-white hover:border-red-200"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                selected
                  ? "bg-red-100 text-red-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {quota.icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900">
                {quota.label}
              </div>

              <div className="mt-0.5 text-xs text-slate-400">
                {quota.description}
              </div>
            </div>

            {selected && (
              <Check
                size={17}
                className="text-red-600"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}