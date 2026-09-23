import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchForm from "@/components/search/SearchForm";

import {
  ArrowRight,
  CalendarDays,
  ShieldCheck,
  TrainFront,
} from "lucide-react";

import HomeAuthGuard from "@/components/auth/HomeAuthGuard";

const popularRoutes = [
  {
    from: "Mumbai",
    to: "New Delhi",
    trains: "42+ trains",
  },
  {
    from: "New Delhi",
    to: "Lucknow",
    trains: "28+ trains",
  },
  {
    from: "Hyderabad",
    to: "Bengaluru",
    trains: "19+ trains",
  },
];

export default function HomePage() {
  return (
    <HomeAuthGuard>
      <div className="min-h-screen overflow-x-hidden bg-slate-50">
        <Navbar />

        <main>
          {/* =====================================================
              HERO
          ===================================================== */}

          <section className="relative bg-slate-950">
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-3xl" />

              <div className="absolute bottom-0 left-1/3 h-[300px] w-[500px] rounded-full bg-blue-600/5 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-16 sm:px-6 lg:px-8 lg:pb-36 lg:pt-24">
              {/* Hero content */}
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                  <TrainFront size={14} />

                  <span>
                    Simple. Fast. Reliable.
                  </span>
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Your journey
                  <span className="block text-red-500">
                    starts here.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                  Search trains, check seat availability
                  and book your journey through a simple
                  and modern booking experience.
                </p>
              </div>

              {/* =================================================
                  SEARCH AREA

                  Important:
                  - z-50 keeps dropdown above next section
                  - overflow-visible allows dropdown to escape
                    the search container
              ================================================= */}

              <div className="relative z-50 mt-10 overflow-visible">
                <SearchForm />
              </div>
            </div>
          </section>

          {/* =====================================================
              FEATURES
          ===================================================== */}

          <section className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-5 md:grid-cols-3">
              <FeatureCard
                icon={
                  <TrainFront size={22} />
                }
                title="Easy Train Search"
                description="Find trains by route, date and availability."
              />

              <FeatureCard
                icon={
                  <ShieldCheck size={22} />
                }
                title="Simple Booking"
                description="Add passengers and complete your booking in a few steps."
              />

              <FeatureCard
                icon={
                  <CalendarDays size={22} />
                }
                title="Manage Trips"
                description="View your bookings and manage your upcoming journeys."
              />
            </div>
          </section>

          {/* =====================================================
              POPULAR ROUTES
          ===================================================== */}

          <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold text-red-600">
                  EXPLORE
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Popular routes
                </h2>
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {popularRoutes.map(
                (route) => (
                  <div
                    key={`${route.from}-${route.to}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-red-200 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* From */}
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">
                          FROM
                        </p>

                        <p className="mt-1 truncate font-semibold text-slate-900">
                          {route.from}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ArrowRight
                        size={20}
                        className="shrink-0 text-slate-300 transition group-hover:text-red-500"
                      />

                      {/* To */}
                      <div className="min-w-0 text-right">
                        <p className="text-xs text-slate-400">
                          TO
                        </p>

                        <p className="mt-1 truncate font-semibold text-slate-900">
                          {route.to}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
                      {route.trains}
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </HomeAuthGuard>
  );
}

/* ============================================================
   FEATURE CARD
============================================================ */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
} 