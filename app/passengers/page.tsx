"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Pencil,
  Plus,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import {
  getStorage,
  setStorage,
  STORAGE_KEYS,
} from "@/lib/storage";

import {
  generateId,
} from "@/lib/utils";

import type {
  Passenger,
  Gender,
  BerthPreference,
} from "@/types/passenger";

import { mockPassengers } from "@/data/passengers";

/* ============================================================
   PAGE
============================================================ */

export default function PassengersPage() {
  const [
    passengers,
    setPassengers,
  ] = useState<Passenger[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingPassenger,
    setEditingPassenger,
  ] = useState<Passenger | null>(
    null
  );

  /* ==========================================================
     LOAD PASSENGERS
  ========================================================== */

  useEffect(() => {
    const storedPassengers =
      getStorage<Passenger[] | null>(
        STORAGE_KEYS.PASSENGERS,
        null
      );

    if (storedPassengers) {
      setPassengers(
        storedPassengers
      );
    } else {
      /*
       * Use mock passengers for the first visit.
       */
      setPassengers(
        mockPassengers
      );

      setStorage(
        STORAGE_KEYS.PASSENGERS,
        mockPassengers
      );
    }

    setLoading(false);
  }, []);

  /* ==========================================================
     SAVE PASSENGERS
  ========================================================== */

  function savePassengers(
    updatedPassengers: Passenger[]
  ) {
    setPassengers(
      updatedPassengers
    );

    setStorage(
      STORAGE_KEYS.PASSENGERS,
      updatedPassengers
    );
  }

  /* ==========================================================
     ADD PASSENGER
  ========================================================== */

  function handleAddPassenger(
    passenger: Omit<
      Passenger,
      "id"
    >
  ) {
    const newPassenger: Passenger = {
      id: generateId(
        "passenger"
      ),
      ...passenger,
    };

    savePassengers([
      ...passengers,
      newPassenger,
    ]);

    setShowForm(false);
  }

  /* ==========================================================
     UPDATE PASSENGER
  ========================================================== */

  function handleUpdatePassenger(
    updatedPassenger: Passenger
  ) {
    const updatedPassengers =
      passengers.map(
        (passenger) =>
          passenger.id ===
          updatedPassenger.id
            ? updatedPassenger
            : passenger
      );

    savePassengers(
      updatedPassengers
    );

    setEditingPassenger(
      null
    );
  }

  /* ==========================================================
     DELETE PASSENGER
  ========================================================== */

  function handleDeletePassenger(
    passengerId: string
  ) {
    const passenger =
      passengers.find(
        (item) =>
          item.id ===
          passengerId
      );

    if (!passenger) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${passenger.name}?`
      );

    if (!confirmed) {
      return;
    }

    const updatedPassengers =
      passengers.filter(
        (item) =>
          item.id !==
          passengerId
      );

    savePassengers(
      updatedPassengers
    );
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading passengers...
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        {/* ====================================================
            HEADER
        ==================================================== */}

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                  <Users size={17} />

                  PASSENGER MASTER
                </div>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Saved Passengers
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Save passenger details once and
                  quickly reuse them during your
                  train bookings.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(true)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
              >
                <Plus size={18} />

                Add Passenger
              </button>
            </div>
          </div>
        </section>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Users size={21} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Saved Passengers
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {
                      passengers.length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {passengers.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <UserRound
                  size={28}
                />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                No passengers saved
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add a passenger to your
                passenger master list so
                you can quickly use their
                details while booking.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowForm(true)
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"
              >
                <Plus size={17} />

                Add Passenger
              </button>
            </div>
          ) : (
            /* ==================================================
               PASSENGER LIST
            ================================================== */

            <div className="grid gap-4 lg:grid-cols-2">
              {passengers.map(
                (passenger, index) => (
                  <PassengerCard
                    key={
                      passenger.id
                    }
                    passenger={
                      passenger
                    }
                    index={index}
                    onEdit={() =>
                      setEditingPassenger(
                        passenger
                      )
                    }
                    onDelete={() =>
                      handleDeletePassenger(
                        passenger.id
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* ======================================================
          ADD FORM
      ====================================================== */}

      {showForm && (
        <PassengerFormModal
          title="Add Passenger"
          onClose={() =>
            setShowForm(false)
          }
          onSubmit={
            handleAddPassenger
          }
        />
      )}

      {/* ======================================================
          EDIT FORM
      ====================================================== */}

      {editingPassenger && (
        <PassengerFormModal
          title="Edit Passenger"
          passenger={
            editingPassenger
          }
          onClose={() =>
            setEditingPassenger(
              null
            )
          }
          onSubmit={(
            values
          ) =>
            handleUpdatePassenger({
              ...values,
              id: editingPassenger.id,
            })
          }
        />
      )}
    </div>
  );
}

/* ============================================================
   PASSENGER CARD
============================================================ */

function PassengerCard({
  passenger,
  index,
  onEdit,
  onDelete,
}: {
  passenger: Passenger;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <UserRound size={21} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                {String(
                  index + 1
                ).padStart(2, "0")}
              </span>

              <h2 className="truncate font-bold text-slate-900">
                {
                  passenger.name
                }
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {passenger.age} years
              {" • "}
              {formatGender(
                passenger.gender
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            aria-label="Edit passenger"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Delete passenger"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Gender
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {formatGender(
              passenger.gender
            )}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Berth Preference
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {formatBerth(
              passenger.berthPreference
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FORM MODAL
============================================================ */

function PassengerFormModal({
  title,
  passenger,
  onClose,
  onSubmit,
}: {
  title: string;
  passenger?: Passenger;
  onClose: () => void;
  onSubmit: (
    values: Omit<
      Passenger,
      "id"
    >
  ) => void;
}) {
  const [
    name,
    setName,
  ] = useState(
    passenger?.name ?? ""
  );

  const [
    age,
    setAge,
  ] = useState(
    passenger?.age
      ? String(passenger.age)
      : ""
  );

  const [
    gender,
    setGender,
  ] = useState<Gender>(
    passenger?.gender ??
      "MALE"
  );

  const [
    berthPreference,
    setBerthPreference,
  ] =
    useState<BerthPreference>(
      passenger?.berthPreference ??
        "NO_PREFERENCE"
    );

  const [
    error,
    setError,
  ] = useState("");

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const trimmedName =
      name.trim();

    const numericAge =
      Number(age);

    if (
      trimmedName.length <
      2
    ) {
      setError(
        "Please enter a valid passenger name."
      );

      return;
    }

    if (
      !numericAge ||
      numericAge < 1 ||
      numericAge > 120
    ) {
      setError(
        "Please enter a valid age between 1 and 120."
      );

      return;
    }

    onSubmit({
      name: trimmedName,
      age: numericAge,
      gender,
      berthPreference,
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                Passenger Master
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5 p-5 sm:p-6"
        >
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Passenger Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Enter passenger name"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Age */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Age
            </label>

            <input
              type="number"
              min="1"
              max="120"
              value={age}
              onChange={(event) =>
                setAge(
                  event.target.value
                )
              }
              placeholder="Enter age"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Gender
            </label>

            <select
              value={gender}
              onChange={(event) =>
                setGender(
                  event.target
                    .value as Gender
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            >
              <option value="MALE">
                Male
              </option>

              <option value="FEMALE">
                Female
              </option>

              <option value="OTHER">
                Other
              </option>
            </select>
          </div>

          {/* Berth */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Berth Preference
            </label>

            <select
              value={
                berthPreference
              }
              onChange={(event) =>
                setBerthPreference(
                  event.target
                    .value as BerthPreference
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            >
              <option value="NO_PREFERENCE">
                No Preference
              </option>

              <option value="LOWER">
                Lower
              </option>

              <option value="MIDDLE">
                Middle
              </option>

              <option value="UPPER">
                Upper
              </option>

              <option value="SIDE_LOWER">
                Side Lower
              </option>

              <option value="SIDE_UPPER">
                Side Upper
              </option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              {passenger ? (
                <>
                  <Pencil size={16} />
                  Update Passenger
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Save Passenger
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function formatGender(
  gender: Gender
): string {
  const labels: Record<
    Gender,
    string
  > = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
  };

  return labels[gender];
}

function formatBerth(
  berth: BerthPreference
): string {
  const labels: Record<
    BerthPreference,
    string
  > = {
    LOWER: "Lower",
    MIDDLE: "Middle",
    UPPER: "Upper",
    SIDE_LOWER: "Side Lower",
    SIDE_UPPER: "Side Upper",
    NO_PREFERENCE:
      "No Preference",
  };

  return labels[berth];
}