import {
  CalendarDays,
  Clock3,
  MapPin,
  TrainFront,
  Users,
} from "lucide-react";

import type { Train } from "@/types/train";

import { calculateFare, formatCurrency } from "@/lib/utils";

interface BookingSummaryProps {
  train: Train;
  journeyDate: string;
  travelClass: Train["classes"][number]["code"];
  passengerCount: number;
  farePerPassenger: number;
}

export default function BookingSummary({
  train,
  journeyDate,
  travelClass,
  passengerCount,
  farePerPassenger,
}: BookingSummaryProps) {
  const fare = calculateFare(
    farePerPassenger,
    passengerCount
  );

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center gap-2">
          <TrainFront
            size={20}
            className="text-red-600"
          />

          <h2 className="font-bold text-slate-900">
            Booking Summary
          </h2>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* Train */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Train
          </p>

          <h3 className="mt-1 font-bold text-slate-900">
            {train.name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {train.number}
          </p>
        </div>

        {/* Journey */}
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <MapPin
              size={17}
              className="text-red-500"
            />

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {train.source}
              </p>

              <p className="text-xs text-slate-500">
                {train.departure}
              </p>
            </div>
          </div>

          <div className="ml-2.5 my-2 h-5 border-l border-dashed border-slate-300" />

          <div className="flex items-center gap-3">
            <MapPin
              size={17}
              className="text-red-500"
            />

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {train.destination}
              </p>

              <p className="text-xs text-slate-500">
                {train.arrival}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <CalendarDays size={15} />
              <span className="text-xs">
                Journey
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatJourneyDate(journeyDate)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock3 size={15} />
              <span className="text-xs">
                Duration
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {train.duration}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <TrainFront size={15} />
              <span className="text-xs">
                Class
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {travelClass}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Users size={15} />
              <span className="text-xs">
                Passengers
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {passengerCount}
            </p>
          </div>
        </div>

        {/* Fare */}
        <div className="border-t border-slate-200 pt-4">
          <div className="flex justify-between text-sm text-slate-500">
            <span>
              Base fare
            </span>

            <span>
              {formatCurrency(fare.baseFare)}
            </span>
          </div>

          <div className="mt-2 flex justify-between text-sm text-slate-500">
            <span>
              Reservation fee
            </span>

            <span>
              {formatCurrency(fare.reservationFee)}
            </span>
          </div>

          <div className="mt-2 flex justify-between text-sm text-slate-500">
            <span>
              GST
            </span>

            <span>
              {formatCurrency(fare.gst)}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="font-bold text-slate-900">
              Total
            </span>

            <span className="text-xl font-bold text-red-600">
              {formatCurrency(fare.totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function formatJourneyDate(date: string) {
  if (!date) {
    return "-";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}