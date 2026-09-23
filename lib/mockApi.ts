import { trains as mockTrains } from "@/data/trains";
import { mockPassengers } from "@/data/passengers";
import { mockUser } from "@/data/users";
import { stations as mockStations } from "@/data/stations";

import type { Train, TrainStop } from "@/types/train";
import type { Passenger } from "@/types/passenger";
import type { User } from "@/types/user";
import type { Station } from "@/data/stations";

import {
  ADMIN_TRAINS_KEY,
  getStorage,
} from "@/lib/storage";

/* =========================================================
   HELPERS
========================================================= */

function normalize(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/* =========================================================
   GET ADMIN TRAINS
========================================================= */

export function getAdminTrains(): Train[] {
  if (typeof window === "undefined") {
    return [];
  }

  return getStorage<Train[]>(
    ADMIN_TRAINS_KEY,
    []
  );
}

/* =========================================================
   GET ALL TRAINS

   Returns:
   1. Static/mock trains
   2. Admin-created trains
========================================================= */

export function getAllTrains(): Train[] {
  const adminTrains =
    getAdminTrains();

  return [
    ...mockTrains,
    ...adminTrains,
  ];
}

/*
 * Keep your existing async API.
 */
export async function getTrains(): Promise<Train[]> {
  return getAllTrains();
}

/* =========================================================
   GET TRAIN BY ID
========================================================= */

export async function getTrainById(
  id: string
): Promise<Train | undefined> {
  const allTrains =
    getAllTrains();

  return allTrains.find(
    (train) => train.id === id
  );
}

/* =========================================================
   GET ALL STATIONS

   IMPORTANT:

   We DO NOT require manually adding admin
   stations to data/stations.ts.

   Stations come from:
   1. Static stations
   2. Admin train source
   3. Admin train destination
   4. Admin intermediate stations
========================================================= */

export function getAllStations(): Station[] {
  const stationMap =
    new Map<string, Station>();

  /*
   * 1. Existing static stations
   */
  for (const station of mockStations) {
    const key =
      normalize(station.city);

    if (!key) continue;

    stationMap.set(
      key,
      station
    );
  }

  /*
   * 2. Admin-created routes
   */
  const adminTrains =
    getAdminTrains();

  for (const train of adminTrains) {
    /*
     * Source
     */
    addDynamicStation(
      stationMap,
      train.source
    );

    /*
     * Intermediate stations
     */
    for (const stop of train.stops ?? []) {
      addDynamicStation(
        stationMap,
        stop.station,
        stop.code
      );
    }

    /*
     * Destination
     */
    addDynamicStation(
      stationMap,
      train.destination
    );
  }

  return Array.from(
    stationMap.values()
  );
}

/* =========================================================
   ADD DYNAMIC STATION
========================================================= */

function addDynamicStation(
  stationMap: Map<string, Station>,
  stationName: string | undefined,
  code?: string
) {
  const name =
    stationName?.trim();

  if (!name) return;

  const key =
    normalize(name);

  /*
   * If static station already exists,
   * keep the static station.
   */
  if (stationMap.has(key)) {
    return;
  }

  stationMap.set(
    key,
    {
      city: name,
      name,
      state: "",
      code:
        code?.trim() ||
        generateStationCode(name),
    }
  );
}

/* =========================================================
   GENERATE STATION CODE

   Used only when admin didn't provide one.
========================================================= */

function generateStationCode(
  stationName: string
): string {
  const clean =
    stationName
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase();

  if (clean.length <= 4) {
    return clean;
  }

  return clean.substring(0, 4);
}

/* =========================================================
   SEARCH TRAINS

   Supports:

   Mumbai → New Delhi

   AND:

   Mumbai → Pune

   Pune → New Delhi

   Pune → Hyderabad

   Solapur → New Delhi

   etc.

   Admin routes are automatically included.
========================================================= */

export async function searchTrains(
  source: string,
  destination: string
): Promise<Train[]> {
  const allTrains =
    getAllTrains();

  const normalizedSource =
    normalize(source);

  const normalizedDestination =
    normalize(destination);

  const results: Train[] = [];

  for (const train of allTrains) {
    /*
     * Build complete route.
     *
     * Example:
     *
     * Mumbai
     * Pune
     * Solapur
     * Hyderabad
     * New Delhi
     */
    const route =
      buildRoute(train);

    const sourceIndex =
      findStation(
        route,
        normalizedSource
      );

    const destinationIndex =
      findStation(
        route,
        normalizedDestination
      );

    /*
     * Both stations must exist.
     */
    if (
      sourceIndex === -1 ||
      destinationIndex === -1
    ) {
      continue;
    }

    /*
     * Source must appear before
     * destination.
     */
    if (
      sourceIndex >= destinationIndex
    ) {
      continue;
    }

    /*
     * Create a train representing
     * only the searched journey.
     */
    const journeyTrain =
      createJourneyTrain(
        train,
        route,
        sourceIndex,
        destinationIndex
      );

    results.push(
      journeyTrain
    );
  }

  return results;
}

/* =========================================================
   BUILD COMPLETE ROUTE
========================================================= */

interface RoutePoint {
  station: string;
  code?: string;
  arrival: string;
  departure: string;
}

function buildRoute(
  train: Train
): RoutePoint[] {
  const route: RoutePoint[] = [];

  /*
   * SOURCE
   */
  route.push({
    station: train.source,
    arrival: train.departure,
    departure: train.departure,
  });

  /*
   * INTERMEDIATE STATIONS
   */
  for (const stop of train.stops ?? []) {
    route.push({
      station: stop.station,
      code: stop.code,
      arrival: stop.arrival,
      departure: stop.departure,
    });
  }

  /*
   * DESTINATION
   */
  route.push({
    station: train.destination,
    arrival: train.arrival,
    departure: train.arrival,
  });

  return route;
}

/* =========================================================
   FIND STATION

   Matches:
   - station name
   - station code

   Case-insensitive.
========================================================= */

function findStation(
  route: RoutePoint[],
  searchValue: string
): number {
  const normalizedSearch =
    normalize(searchValue);

  return route.findIndex(
    (point) => {
      const stationName =
        normalize(point.station);

      const stationCode =
        normalize(point.code);

      return (
        stationName ===
          normalizedSearch ||
        stationCode ===
          normalizedSearch
      );
    }
  );
}

/* =========================================================
   CREATE JOURNEY TRAIN
========================================================= */

function createJourneyTrain(
  train: Train,
  route: RoutePoint[],
  sourceIndex: number,
  destinationIndex: number
): Train {
  const source =
    route[sourceIndex];

  const destination =
    route[destinationIndex];

  /*
   * Calculate duration for
   * searched section only.
   */
  const duration =
    calculateDuration(
      source.departure,
      destination.arrival
    );

  /*
   * Keep only stations between
   * searched source and destination.
   */
  const stops: TrainStop[] =
    route
      .slice(
        sourceIndex + 1,
        destinationIndex
      )
      .map((point) => ({
        station:
          point.station,

        code:
          point.code,

        arrival:
          point.arrival,

        departure:
          point.departure,

        halt:
          calculateHalt(
            point.arrival,
            point.departure
          ),
      }));

  return {
    ...train,

    /*
     * IMPORTANT:
     * Replace original source/destination
     * with searched route.
     */
    source:
      source.station,

    destination:
      destination.station,

    departure:
      source.departure,

    arrival:
      destination.arrival,

    duration,

    stops,
  };
}

/* =========================================================
   CALCULATE DURATION
========================================================= */

function calculateDuration(
  departure: string,
  arrival: string
): string {
  const departureMinutes =
    timeToMinutes(
      departure
    );

  let arrivalMinutes =
    timeToMinutes(
      arrival
    );

  if (
    Number.isNaN(
      departureMinutes
    ) ||
    Number.isNaN(
      arrivalMinutes
    )
  ) {
    return "";
  }

  /*
   * Overnight journey.
   */
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

  const hours =
    Math.floor(
      totalMinutes / 60
    );

  const minutes =
    totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${String(
    minutes
  ).padStart(2, "0")}m`;
}

/* =========================================================
   CALCULATE HALT
========================================================= */

function calculateHalt(
  arrival: string,
  departure: string
): string | undefined {
  const arrivalMinutes =
    timeToMinutes(
      arrival
    );

  let departureMinutes =
    timeToMinutes(
      departure
    );

  if (
    Number.isNaN(
      arrivalMinutes
    ) ||
    Number.isNaN(
      departureMinutes
    )
  ) {
    return undefined;
  }

  if (
    departureMinutes <
    arrivalMinutes
  ) {
    departureMinutes +=
      24 * 60;
  }

  return `${
    departureMinutes -
    arrivalMinutes
  } min`;
}

/* =========================================================
   TIME TO MINUTES
========================================================= */

function timeToMinutes(
  time: string
): number {
  if (!time) {
    return NaN;
  }

  const [
    hours,
    minutes,
  ] = time
    .split(":")
    .map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return NaN;
  }

  return (
    hours * 60 +
    minutes
  );
}

/* =========================================================
   PASSENGERS
========================================================= */

export async function getPassengers(): Promise<
  Passenger[]
> {
  return mockPassengers;
}

/* =========================================================
   USER
========================================================= */

export async function getUser(): Promise<User> {
  return mockUser;
}