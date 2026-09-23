"use client";

import { useState } from "react";
import {
  Check,
  MapPin,
  Search,
} from "lucide-react";

import type { Station } from "@/data/stations";

interface StationSelectorProps {
  label: string;
  value: Station | null;
  stations: Station[];
  onChange: (station: Station) => void;
  excludeStation?: string;
}

export default function StationSelector({
  label,
  value,
  stations,
  onChange,
  excludeStation,
}: StationSelectorProps) {
  const [open, setOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  /* ==========================================================
     FILTER STATIONS
  ========================================================== */

  const filteredStations =
    stations.filter((station) => {
      const query =
        search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        station.name
          .toLowerCase()
          .includes(query) ||
        station.city
          .toLowerCase()
          .includes(query) ||
        station.code
          .toLowerCase()
          .includes(query);

      const isExcluded =
        station.code ===
        excludeStation;

      return (
        matchesSearch &&
        !isExcluded
      );
    });

  /* ==========================================================
     SELECT STATION
  ========================================================== */

  function handleSelect(
    station: Station
  ) {
    onChange(station);
    setOpen(false);
    setSearch("");
  }

  /* ==========================================================
     CLOSE
  ========================================================== */

  function handleClose() {
    setOpen(false);
    setSearch("");
  }

  return (
    <div className="relative w-full">
      {/* =====================================================
          LABEL
      ===================================================== */}

      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      {/* =====================================================
          SELECT BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        className={`flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3.5 text-left transition ${
          open
            ? "border-red-400 ring-2 ring-red-100"
            : "border-slate-200 hover:border-red-300"
        }`}
      >
        {/* Icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <MapPin size={18} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {value ? (
            <>
              <div className="truncate text-sm font-semibold text-slate-900">
                {value.city}
              </div>

              <div className="truncate text-xs text-slate-400">
                {value.name} •{" "}
                {value.code}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-medium text-slate-400">
                Select station
              </div>

              <div className="truncate text-xs text-slate-300">
                Search by city or station
              </div>
            </>
          )}
        </div>
      </button>

      {/* =====================================================
          DROPDOWN
      ===================================================== */}

      {open && (
        <>
          {/* =================================================
              BACKDROP

              This lets the user click outside the dropdown
              to close it.

              pointer-events-auto makes it clickable,
              while z-40 keeps it behind the dropdown.
          ================================================= */}

          <div
            className="fixed inset-0 z-40"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* =================================================
              DROPDOWN CONTAINER

              z-[100] keeps this above:
              - feature cards
              - hero content
              - other sections
              - search card
          ================================================= */}

          <div className="absolute left-0 top-full z-[100] mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* ===============================================
                SEARCH INPUT
            =============================================== */}

            <div className="border-b border-slate-100 bg-white p-3">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-transparent transition focus-within:ring-red-100">
                <Search
                  size={17}
                  className="shrink-0 text-slate-400"
                />

                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  placeholder="Search city or station..."
                  className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* ===============================================
                STATION LIST

                max-h-60 = roughly 3-4 stations
                depending on screen size.

                overflow-y-auto = scroll remaining stations.
            =============================================== */}

            <div className="max-h-60 overflow-y-auto p-2 overscroll-contain">
              {filteredStations.length >
              0 ? (
                <div className="space-y-1">
                  {filteredStations.map(
                    (station) => {
                      const selected =
                        value?.code ===
                        station.code;

                      return (
                        <button
                          key={
                            station.code
                          }
                          type="button"
                          onClick={() =>
                            handleSelect(
                              station
                            )
                          }
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                            selected
                              ? "bg-red-50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          {/* Station icon */}
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              selected
                                ? "bg-red-100 text-red-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <MapPin
                              size={17}
                            />
                          </div>

                          {/* Station information */}
                          <div className="min-w-0 flex-1">
                            <div
                              className={`truncate text-sm font-medium ${
                                selected
                                  ? "text-red-700"
                                  : "text-slate-900"
                              }`}
                            >
                              {
                                station.city
                              }
                            </div>

                            <div className="truncate text-xs text-slate-500">
                              {
                                station.name
                              }
                            </div>
                          </div>

                          {/* Station code */}
                          <span
                            className={`shrink-0 text-xs font-semibold ${
                              selected
                                ? "text-red-500"
                                : "text-slate-400"
                            }`}
                          >
                            {
                              station.code
                            }
                          </span>

                          {/* Selected */}
                          {selected && (
                            <Check
                              size={
                                18
                              }
                              className="shrink-0 text-red-600"
                            />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              ) : (
                /* =========================================
                   NO RESULTS
                ========================================= */

                <div className="px-4 py-8 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    <MapPin
                      size={20}
                      className="text-slate-300"
                    />
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No stations found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try another city or
                    station name
                  </p>
                </div>
              )}
            </div>

            {/* ===============================================
                FOOTER / RESULT COUNT

                Only show when there are many stations.
            =============================================== */}

            {filteredStations.length >
              4 && (
              <div className="border-t border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-center text-[10px] font-medium text-slate-400">
                  Scroll to see more
                  stations
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}