"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Edit3,
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

import type {
  AuthUser,
} from "@/types/user";

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

  if (
    arrivalMinutes <
    departureMinutes
  ) {
    arrivalMinutes +=
      24 * 60;
  }

  const totalMinutes =
    arrivalMinutes -
    departureMinutes;

  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes =
    totalMinutes % 60;

  return `${hours}h ${minutes
    .toString()
    .padStart(2, "0")}m`;
}

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

  if (
    departureMinutes <
    arrivalMinutes
  ) {
    departureMinutes +=
      24 * 60;
  }

  const haltMinutes =
    departureMinutes -
    arrivalMinutes;

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

    stops: z.array(
      stopSchema
    ),
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

export default function EditTrainPage() {
  const router = useRouter();

  const params =
    useParams<{
      id: string;
    }>();

  const trainId =
    params.id;

  const allTrains =
    useMemo(
      () =>
        getStorage<Train[]>(
          ADMIN_TRAINS_KEY,
          []
        ),
      []
    );

  const existingTrain =
    allTrains.find(
      (train) =>
        train.id === trainId
    );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,

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
      departure: "",
      arrival: "",
      duration: "",

      runsOn: [],

      classes: {
        "1A": {
          enabled: false,
          fare: 0,
          available: 0,
        },

        "2A": {
          enabled: false,
          fare: 0,
          available: 0,
        },

        "3A": {
          enabled: false,
          fare: 0,
          available: 0,
        },

        SL: {
          enabled: false,
          fare: 0,
          available: 0,
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
     LOAD EXISTING TRAIN
  ========================================================== */

  useEffect(() => {
    if (!existingTrain) {
      return;
    }

    const classes = {
      "1A": {
        enabled: false,
        fare: 0,
        available: 0,
      },

      "2A": {
        enabled: false,
        fare: 0,
        available: 0,
      },

      "3A": {
        enabled: false,
        fare: 0,
        available: 0,
      },

      SL: {
        enabled: false,
        fare: 0,
        available: 0,
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
    };

    existingTrain.classes.forEach(
      (item) => {
        classes[item.code] = {
          enabled: true,
          fare: item.fare,
          available:
            item.available,
        };
      }
    );

    reset({
      number:
        existingTrain.number,

      name:
        existingTrain.name,

      source:
        existingTrain.source,

      destination:
        existingTrain.destination,

      departure:
        existingTrain.departure,

      arrival:
        existingTrain.arrival,

      duration:
        existingTrain.duration,

      runsOn:
        existingTrain.runsOn,

      classes,

      stops:
        existingTrain.stops ?? [],
    });
  }, [
    existingTrain,
    reset,
  ]);

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
     WATCH
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
     AUTOMATIC DURATION
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
     AUTH
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
     TOGGLE DAY
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
     ADD STOP
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
    const currentTrains =
      getStorage<Train[]>(
        ADMIN_TRAINS_KEY,
        []
      );

    const calculatedDuration =
      calculateDuration(
        values.departure,
        values.arrival
      );

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

    const authUser = getStorage<AuthUser | null>(STORAGE_KEYS.AUTH, null);

    const updatedTrain: Train = {
      id: trainId,

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

      duration:
        calculatedDuration,

      runsOn:
        values.runsOn,

      stops,

      classes,

      createdById: existingTrain?.createdById || authUser?.id || "admin-1",
    };

    const updatedTrains =
      currentTrains.map(
        (train) =>
          train.id === trainId
            ? updatedTrain
            : train
      );

    setStorage(
      ADMIN_TRAINS_KEY,
      updatedTrains
    );

    router.push(
      "/admin"
    );
  }

  /* ==========================================================
     TRAIN NOT FOUND
  ========================================================== */

  if (!existingTrain) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <TrainFront
              size={25}
            />
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Train not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            This train route may have been
            deleted or is no longer available.
          </p>

          <Link
            href="/admin"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"
          >
            <ArrowLeft
              size={16}
            />
            Back to Admin
          </Link>

        </div>

      </div>
    );
  }

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

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

        {/* TITLE */}

        <div className="mb-8">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">

            <Edit3
              size={24}
            />

          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Edit Train Route
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Update train details, route,
            timings, running days, classes,
            fares and intermediate stations.
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
              description="Update the basic information about the train."
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
              ROUTE
          ================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <SectionHeading
              number="02"
              title="Route & Timing"
              description="Update the source, destination and journey timing."
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

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
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Automatically calculated from
                  departure and arrival.
                </p>

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
              description="Update available classes, fares and seat availability."
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
                      className={`rounded-xl border p-4 ${
                        enabled
                          ? "border-red-200 bg-red-50/40"
                          : "border-slate-200 bg-white"
                      }`}
                    >

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

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
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                          />

                        </div>

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
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                          />

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>

          {/* ==================================================
              STATIONS
          ================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <SectionHeading
                number="05"
                title="Intermediate Stations"
                description="Update stations between source and destination."
              />

              <button
                type="button"
                onClick={
                  addStop
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100"
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
                  Add stations between the
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
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >

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
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>

                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

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

                          <FormInput
                            label="Station Code"
                            placeholder="PUNE"
                            {...register(
                              `stops.${index}.code`
                            )}
                          />

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
                              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
                            />

                            <p className="mt-1.5 text-xs text-slate-400">
                              Auto calculated
                            </p>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </section>

          {/* INFO */}

          <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <p className="text-sm font-semibold text-blue-900">
              Editing Train Route
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              Changes will immediately update
              this train in the frontend booking
              simulation. Journey duration and
              station halt times are calculated
              automatically.
            </p>

          </section>

          {/* BUTTONS */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              href="/admin"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                isSubmitting
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >

              <Save size={17} />

              {isSubmitting
                ? "Updating..."
                : "Update Train Route"}

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
   INPUT
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