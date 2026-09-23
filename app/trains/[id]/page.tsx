import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TrainDetails from "@/components/trains/TrainDetails";
import { getTrainById } from "@/lib/mockApi";

export default async function TrainPage({
  params,
  searchParams,
}: {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    date?: string;
  }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const journeyDate =
    query.date ?? "2026-09-23";

  const train = await getTrainById(id);

  if (!train) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={25} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Train not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              The train you are looking for doesn't exist
              in our mock data.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
            >
              Back to Search
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href={`/search?from=${encodeURIComponent(
              train.source
            )}&to=${encodeURIComponent(
              train.destination
            )}&date=${journeyDate}`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600"
          >
            <ArrowLeft size={16} />
            Back to search results
          </Link>

          <TrainDetails
            train={train}
            journeyDate={journeyDate}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}