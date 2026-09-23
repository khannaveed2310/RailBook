"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  TrainFront,
} from "lucide-react";

import {
  useFieldArray,
  useForm,
} from "react-hook-form";

import { z } from "zod";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  getStorage,
  setStorage,
  ADMIN_TRAINS_KEY,
  STORAGE_KEYS,
} from "@/lib/storage";

import {
  generateId,
} from "@/lib/utils";

import type { AuthUser } from "@/types/user";

import type {
  Train,
  TrainClassCode,
  TrainStop,
} from "@/types/train";

/* ============================================================
   CONSTANTS
============================================================ */

const RUNNING_DAYS = [
  {
    value: "MON",
    label: "Monday",
    short: "Mon",
  },
  {
    value: "TUE",
    label: "Tuesday",
    short: "Tue",
  },
  {
    value: "WED",
    label: "Wednesday",
    short: "Wed",
  },
  {
    value: "THU",
    label: "Thursday",
    short: "Thu",
  },
  {
    value: "FRI",
    label: "Friday",
    short: "Fri",
  },
  {
    value: "SAT",
    label: "Saturday",
    short: "Sat",
  },
  {
    value: "SUN",
    label: "Sunday",
    short: "Sun",
  },
];

const TRAIN_CLASSES: {
  code: TrainClassCode;
  name: string;
}[] = [
  {
    code: "1A",
    name: "First AC",
  },
  {
    code: "2A",
    name: "Second AC",
  },
  {
    code: "3A",
    name: "Third AC",
  },
  {
    code: "SL",
    name: "Sleeper",
  },
  {
    code: "CC",
    name: "Chair Car",
  },
  {
    code: "2S",
    name: "Second Sitting",
  },
];

/* ============================================================
   TIME HELPERS
============================================================ */

/**
 * Convert HH:mm into total minutes.
 */
function timeToMinutes(
  time: string
): number {
  if (!time) {
    return NaN;
  }

  const [hours, minutes] =
    time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return NaN;
  }

  return hours * 60 + minutes;
}

/**
 * Calculate duration between two times.
 *
 * Examples:
 *
 * 10:00 -> 18:00 = 8h 00m
 * 10:00 -> 18:30 = 8h 30m
 * 22:30 -> 02:30 = 4h 00m
 */
function calculateDuration(
  departure: string,
  arrival: string
): string {
  if (!departure || !arrival) {
    return "";
  }

  let departureMinutes =
    timeToMinutes(departure);

  let arrivalMinutes =
    timeToMinutes(arrival);

  if (
    Number.isNaN(departureMinutes) ||
    Number.isNaN(arrivalMinutes)
  ) {
    return "";
  }

  /**
   * If arrival is earlier than departure,
   * assume arrival is on the next day.
   */
  if (arrivalMinutes < departureMinutes) {
    arrivalMinutes += 24 * 60;
  }

  const totalMinutes =
    arrivalMinutes - departureMinutes;

  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes =
    totalMinutes % 60;

  return `${hours}h ${minutes
    .toString()
    .padStart(2, "0")}m`;
}

/**
 * Calculate halt time between station arrival
 * and station departure.
 *
 * Examples:
 *
 * 10:00 -> 10:05 = 5 min
 * 12:30 -> 12:45 = 15 min
 * 18:10 -> 18:25 = 15 min
 */
function calculateHalt(
  arrival: string,
  departure: string
): string {
  if (!arrival || !departure) {
    return "";
  }

  let arrivalMinutes =
    timeToMinutes(arrival);

  let departureMinutes =
    timeToMinutes(departure);

  if (
    Number.isNaN(arrivalMinutes) ||
    Number.isNaN(departureMinutes)
  ) {
    return "";
  }

  /**
   * Handles overnight station timings.
   */
  if (departureMinutes < arrivalMinutes) {
    departureMinutes += 24 * 60;
  }

  const haltMinutes =
    departureMinutes - arrivalMinutes;

  return `${haltMinutes} min`;
}

/* ============================================================
   SCHEMA
============================================================ */

const stopSchema = z.object({
  station: z
    .string()
    .trim()
    .min(
      2,
      "Station name is required"
    ),

  code: z
    .string()
    .trim()
    .optional(),

  arrival: z
    .string()
    .min(
      1,
      "Arrival time is required"
    ),

  departure: z
    .string()
    .min(
      1,
      "Departure time is required"
    ),

  /**
   * Halt is automatically calculated.
   */
  halt: z
    .string()
    .optional(),
});

const classSchema = z.object({
  enabled: z.boolean(),

  fare: z.coerce
    .number()
    .int()
    .min(
      0,
      "Fare cannot be negative"
    ),

  available: z.coerce
    .number()
    .int()
    .min(
      0,
      "Seats cannot be negative"
    ),
});

const routeSchema = z
  .object({
    number: z
      .string()
      .trim()
      .min(
        4,
        "Train number is required"
      ),

    name: z
      .string()
      .trim()
      .min(
        3,
        "Train name is required"
      ),

    source: z
      .string()
      .trim()
      .min(
        2,
        "Source is required"
      ),

    destination: z
      .string()
      .trim()
      .min(
        2,
        "Destination is required"
      ),

    departure: z
      .string()
      .min(
        1,
        "Departure time is required"
      ),

    arrival: z
      .string()
      .min(
        1,
        "Arrival time is required"
      ),

    /**
     * Automatically calculated.
     */
    duration: z
      .string()
      .optional(),

    runsOn: z
      .array(z.string())
      .min(
        1,
        "Select at least one running day"
      ),

    classes: z.object({
      "1A": classSchema,
      "2A": classSchema,
      "3A": classSchema,
      SL: classSchema,
      CC: classSchema,
      "2S": classSchema,
    }),

    stops: z.array(stopSchema),
  })

  .refine(
    (data) =>
      data.source.toLowerCase() !==
      data.destination.toLowerCase(),
    {
      message:
        "Source and destination must be different",

      path: [
        "destination",
      ],
    }
  )

  .refine(
    (data) =>
      Object.values(
        data.classes
      ).some(
        (item) =>
          item.enabled
      ),
    {
      message:
        "Select at least one train class",

      path: [
        "classes",
      ],
    }
  );

type RouteFormValues =
  z.infer<typeof routeSchema>;

type RouteFormInput =
  z.input<typeof routeSchema>;

/* ============================================================
   PAGE
============================================================ */

export default function AddTrainPage() {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<
    RouteFormInput,
    undefined,
    RouteFormValues
  >({
    resolver:
      zodResolver(
        routeSchema
      ),

    defaultValues: {
      number: "",
      name: "",
      source: "",
      destination: "",

      departure: "10:00",
      arrival: "18:00",

      duration: "8h 00m",

      runsOn: [
        "MON",
        "TUE",
        "WED",
        "THU",
        "FRI",
        "SAT",
        "SUN",
      ],

      classes: {
        "1A": {
          enabled: true,
          fare: 2500,
          available: 10,
        },

        "2A": {
          enabled: true,
          fare: 1500,
          available: 20,
        },

        "3A": {
          enabled: true,
          fare: 1000,
          available: 30,
        },

        SL: {
          enabled: true,
          fare: 500,
          available: 50,
        },

        CC: {
          enabled: false,
          fare: 0,
          available: 0,
        },

        "2S": {
          enabled: false,
          fare: 0,
          available: 0,
        },
      },

      stops: [],
    },
  });

  /* ==========================================================
     FIELD ARRAY
  ========================================================== */

  const {
    fields: stopFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "stops",
  });

  /* ==========================================================
     WATCH VALUES
  ========================================================== */

  const selectedDays =
    watch("runsOn");

  const watchedClasses =
    watch("classes");

  const departure =
    watch("departure");

  const arrival =
    watch("arrival");

  const watchedStops =
    watch("stops");

  /* ==========================================================
     AUTOMATIC JOURNEY DURATION
  ========================================================== */

  useEffect(() => {
    const duration =
      calculateDuration(
        departure,
        arrival
      );

    setValue(
      "duration",
      duration,
      {
        shouldValidate: true,
      }
    );
  }, [
    departure,
    arrival,
    setValue,
  ]);

  /* ==========================================================
     ADMIN AUTH
  ========================================================== */

  useEffect(() => {
    const authUser =
      getStorage<AuthUser | null>(
        STORAGE_KEYS.AUTH,
        null
      );

    if (
      !authUser ||
      !authUser.isLoggedIn ||
      authUser.role !== "ADMIN"
    ) {
      router.replace(
        "/login"
      );
    }
  }, [router]);

  /* ==========================================================
     RUNNING DAYS
  ========================================================== */

  function toggleDay(
    day: string
  ) {
    const current =
      selectedDays ?? [];

    if (
      current.includes(day)
    ) {
      setValue(
        "runsOn",
        current.filter(
          (item) =>
            item !== day
        )
      );
    } else {
      setValue(
        "runsOn",
        [
          ...current,
          day,
        ]
      );
    }
  }

  /* ==========================================================
     ADD STATION
  ========================================================== */

  function addStop() {
    append({
      station: "",
      code: "",
      arrival: "12:00",
      departure: "12:05",
      halt: "5 min",
    });
  }

  /* ==========================================================
     SUBMIT
  ========================================================== */

  function onSubmit(
    values: RouteFormValues
  ) {
    const existingTrains =
      getStorage<Train[]>(
        ADMIN_TRAINS_KEY,
        []
      );

    /* --------------------------------------------------------
       ALWAYS CALCULATE JOURNEY DURATION
    -------------------------------------------------------- */

    const calculatedDuration =
      calculateDuration(
        values.departure,
        values.arrival
      );

    /* --------------------------------------------------------
       BUILD CLASSES
    -------------------------------------------------------- */

    const classes =
      TRAIN_CLASSES
        .filter(
          ({ code }) =>
            values.classes[
              code
            ].enabled
        )
        .map(
          ({
            code,
            name,
          }) => ({
            code,
            name,

            fare:
              values.classes[
                code
              ].fare,

            available:
              values.classes[
                code
              ].available,
          })
        );

    /* --------------------------------------------------------
       BUILD INTERMEDIATE STATIONS
       
       Halt is calculated from:
       Arrival -> Departure
    -------------------------------------------------------- */

    const stops: TrainStop[] =
      values.stops.map(
        (stop) => ({
          station:
            stop.station.trim(),

          code:
            stop.code?.trim() ||
            undefined,

          arrival:
            stop.arrival,

          departure:
            stop.departure,

          halt:
            calculateHalt(
              stop.arrival,
              stop.departure
            ),
        })
      );

    /* --------------------------------------------------------
       CREATE TRAIN
    -------------------------------------------------------- */

    const authUser = getStorage<AuthUser | null>(STORAGE_KEYS.AUTH, null);

    const newTrain: Train = {
      id: generateId(
        "train"
      ),

      number:
        values.number.trim(),

      name:
        values.name.trim(),

      source:
        values.source.trim(),

      destination:
        values.destination.trim(),

      departure:
        values.departure,

      arrival:
        values.arrival,

      /**
       * Automatically calculated
       * from departure and arrival.
       */
      duration:
        calculatedDuration,

      runsOn:
        values.runsOn,

      stops,

      classes,

      createdById: authUser?.id || "admin-1",
    };

    /* --------------------------------------------------------
       SAVE
    -------------------------------------------------------- */

    setStorage(
      ADMIN_TRAINS_KEY,
      [
        ...existingTrains,
        newTrain,
      ]
    );

    /* --------------------------------------------------------
       REDIRECT
    -------------------------------------------------------- */

    router.push(
      "/admin"
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6 lg:px-8">

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-red-600"
          >
            <ArrowLeft
              size={17}
            />

            Back to Admin
          </Link>

        </div>

      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ====================================================
            PAGE HEADING
        ==================================================== */}

        <div className="mb-8">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">

            <TrainFront
              size={24}
            />

          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Add Train Route
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Create a complete train
            route including running
            days, classes, fares and
            intermediate stations.
          </p>

        </div>

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="space-y-6"
        >

          {/* ==================================================
              TRAIN INFORMATION
          ================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <SectionHeading
              number="01"
              title="Train Information"
              description="Basic information about the train."
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <FormInput
                label="Train Number"
                placeholder="12951"
                error={
                  errors.number
                    ?.message
                }
                {...register(
                  "number"
                )}
              />

              <FormInput
                label="Train Name"
                placeholder="Mumbai Rajdhani"
                error={
                  errors.name
                    ?.message
                }
                {...register(
                  "name"
                )}
              />

            </div>

          </section>

          {/* ==================================================
              ROUTE & TIMING
          ================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <SectionHeading
              number="02"
              title="Route & Timing"
              description="Define the source, destination and journey timing."
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              {/* SOURCE */}

              <FormInput
                label="Source Station"
                placeholder="Mumbai"
                error={
                  errors.source
                    ?.message
                }
                {...register(
                  "source"
                )}
              />

              {/* DESTINATION */}

              <FormInput
                label="Destination Station"
                placeholder="New Delhi"
                error={
                  errors.destination
                    ?.message
                }
                {...register(
                  "destination"
                )}
              />

              {/* DEPARTURE */}

              <FormInput
                label="Departure"
                type="time"
                error={
                  errors.departure
                    ?.message
                }
                {...register(
                  "departure"
                )}
              />

              {/* ARRIVAL */}

              <FormInput
                label="Arrival"
                type="time"
                error={
                  errors.arrival
                    ?.message
                }
                {...register(
                  "arrival"
                )}
              />

              {/* JOURNEY DURATION */}

              <div className="sm:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Journey Duration
                </label>

                <input
                  type="text"
                  readOnly
                  value={
                    calculateDuration(
                      departure,
                      arrival
                    )
                  }
                  placeholder="Automatically calculated"
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
                />
              </div>

            </div>

          </section>

          {/* ==================================================
              RUNNING DAYS
          ================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <SectionHeading
              number="03"
              title="Running Days"
              description="Select the days on which this train operates."
            />

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">

              {RUNNING_DAYS.map(
                (day) => {

                  const selected =
                    selectedDays?.includes(
                      day.value
                    );

                  return (
                    <button
                      key={
                        day.value
                      }
                      type="button"
                      onClick={() =>
                        toggleDay(
                          day.value
                        )
                      }
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        selected
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50"
                      }`}
                    >
                      {day.short}
                    </button>
                  );
                }
              )}

            </div>

            {errors.runsOn && (
              <p className="mt-3 text-xs text-red-500">
                {
                  errors.runsOn
                    .message
                }
              </p>
            )}

          </section>

          {/* ==================================================
              CLASSES
          ================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <SectionHeading
              number="04"
              title="Classes, Fares & Availability"
              description="Choose the classes available on this train and configure their fare and seats."
            />

            <div className="mt-6 space-y-3">

              {TRAIN_CLASSES.map(
                ({
                  code,
                  name,
                }) => {

                  const enabled =
                    watchedClasses?.[
                      code
                    ]?.enabled;

                  return (
                    <div
                      key={code}
                      className={`rounded-xl border p-4 transition ${
                        enabled
                          ? "border-red-200 bg-red-50/40"
                          : "border-slate-200 bg-white"
                      }`}
                    >

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                        {/* CLASS */}

                        <label className="flex min-w-[190px] cursor-pointer items-center gap-3">

                          <input
                            type="checkbox"
                            {...register(
                              `classes.${code}.enabled`
                            )}
                            className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />

                          <div>

                            <p className="font-bold text-slate-900">
                              {code}
                            </p>

                            <p className="text-xs text-slate-500">
                              {name}
                            </p>

                          </div>

                        </label>

                        {/* FARE */}

                        <div className="flex-1">

                          <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                            Fare (₹)
                          </label>

                          <input
                            type="number"
                            min="0"
                            disabled={
                              !enabled
                            }
                            {...register(
                              `classes.${code}.fare`
                            )}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          />

                        </div>

                        {/* SEATS */}

                        <div className="flex-1">

                          <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                            Available Seats
                          </label>

                          <input
                            type="number"
                            min="0"
                            disabled={
                              !enabled
                            }
                            {...register(
                              `classes.${code}.available`
                            )}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          />

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {errors.classes && (
              <p className="mt-3 text-xs text-red-500">
                {
                  errors.classes
                    .message
                }
              </p>
            )}

          </section>

          {/* ==================================================
              INTERMEDIATE STATIONS
          ================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <SectionHeading
                number="05"
                title="Intermediate Stations"
                description="Add stations between the source and destination."
              />

              <button
                type="button"
                onClick={
                  addStop
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                <Plus size={16} />

                Add Station
              </button>

            </div>

            {stopFields.length ===
            0 ? (

              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">

                <TrainFront
                  size={25}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  No intermediate stations
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Add stations if this
                  train stops between
                  source and destination.
                </p>

              </div>

            ) : (

              <div className="mt-6 space-y-4">

                {stopFields.map(
                  (
                    field,
                    index
                  ) => {

                    const stop =
                      watchedStops?.[
                        index
                      ];

                    const halt =
                      calculateHalt(
                        stop?.arrival ??
                          "",
                        stop?.departure ??
                          ""
                      );

                    return (
                      <div
                        key={
                          field.id
                        }
                        className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >

                        {/* STATION HEADER */}

                        <div className="mb-4 flex items-center justify-between">

                          <div className="flex items-center gap-2">

                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                              {index +
                                1}
                            </div>

                            <p className="text-sm font-bold text-slate-700">
                              Intermediate
                              Station
                            </p>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              remove(
                                index
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            aria-label="Remove station"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>

                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

                          {/* STATION */}

                          <FormInput
                            label="Station"
                            placeholder="Pune Junction"
                            error={
                              errors
                                .stops?.[
                                index
                              ]?.station
                                ?.message
                            }
                            {...register(
                              `stops.${index}.station`
                            )}
                          />

                          {/* CODE */}

                          <FormInput
                            label="Station Code"
                            placeholder="PUNE"
                            error={
                              errors
                                .stops?.[
                                index
                              ]?.code
                                ?.message
                            }
                            {...register(
                              `stops.${index}.code`
                            )}
                          />

                          {/* ARRIVAL */}

                          <FormInput
                            label="Arrival"
                            type="time"
                            error={
                              errors
                                .stops?.[
                                index
                              ]?.arrival
                                ?.message
                            }
                            {...register(
                              `stops.${index}.arrival`
                            )}
                          />

                          {/* DEPARTURE */}

                          <FormInput
                            label="Departure"
                            type="time"
                            error={
                              errors
                                .stops?.[
                                index
                              ]?.departure
                                ?.message
                            }
                            {...register(
                              `stops.${index}.departure`
                            )}
                          />

                          {/* AUTOMATIC HALT */}

                          <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Halt
                            </label>

                            <input
                              type="text"
                              readOnly
                              value={
                                halt
                              }
                              placeholder="Auto"
                              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
                            />

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

            {/* ROUTE EXAMPLE */}

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

              <p className="text-sm font-semibold text-blue-900">
                Route example
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Mumbai → Pune → Solapur →
                Hyderabad → New Delhi
              </p>

            </div>

          </section>

          {/* ==================================================
              INFORMATION
          ================================================== */}

          <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <p className="text-sm font-semibold text-blue-900">
              Frontend Demo
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              This train will be saved in
              localStorage and will immediately
              become available in the user booking
              portal. No real railway API or backend
              is connected.
            </p>

          </section>

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              href="/admin"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                isSubmitting
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {isSubmitting
                ? "Saving..."
                : "Save Train Route"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
        {number}
      </div>

      <div>

        <h2 className="font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   FORM INPUT
============================================================ */

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function FormInput({
  label,
  error,
  ...props
}: FormInputProps) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        {...props}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
          error
            ? "border-red-400"
            : "border-slate-200"
        }`}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}

    </div>
  );
}