import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  MapPin,
  Clock3,
  Users,
} from "lucide-react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* =====================================================
            LEFT — Hero Panel
        ===================================================== */}
        <div className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between">
          {/* Background Image */}
          <Image
            src="/train-hero.jpg"
            alt="Modern train at sunset"
            fill
            className="object-cover opacity-35"
            priority
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/50" />

          {/* Top Logo */}
          <div className="relative z-10 p-8 xl:p-12">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-3 text-2xl font-bold text-white transition hover:opacity-90"
            >
              <Image
                src="/favicon.ico"
                alt="RailBook"
                width={42}
                height={42}
                className="rounded-xl shadow-md"
              />
              RailBook
            </Link>
          </div>

          {/* Main content — Centered vertically & horizontally with large text */}
          <div className="relative z-10 mx-auto my-auto flex w-full max-w-xl flex-col items-center px-8 py-6 text-center xl:max-w-2xl xl:px-12">
            <p className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.25em] text-red-400 sm:text-sm">
              Smart Railway Booking
            </p>

            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl xl:text-6xl">
              Your journey starts
              <span className="mt-1 block text-red-500">
                with a single click.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg xl:text-xl">
              Search trains, manage passengers, review bookings and simulate your
              complete railway booking experience.
            </p>

            {/* Feature pills — centered */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <FeaturePill
                icon={<MapPin size={15} className="text-red-400" />}
                label="500+ Routes"
              />
              <FeaturePill
                icon={<Clock3 size={15} className="text-red-400" />}
                label="Instant Booking"
              />
              <FeaturePill
                icon={<Users size={15} className="text-red-400" />}
                label="Passenger Master"
              />
            </div>
          </div>

          {/* Footer — Centered */}
          <div className="relative z-10 flex items-center justify-center gap-2 p-8 text-xs text-slate-400 xl:p-12 sm:text-sm">
            <ShieldCheck size={16} className="text-red-400" />
            <span>Secure frontend demo environment</span>
          </div>
        </div>

        {/* =====================================================
            RIGHT — Form Panel
        ===================================================== */}
        <div className="flex min-h-screen flex-col lg:min-h-0">
          {/* Scrollable form area */}
          <div className="flex flex-1 items-center justify-center overflow-y-auto px-5 py-10 sm:px-8 lg:py-12">
            <div className="w-full max-w-md">
              {/* Mobile logo */}
              <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
                <Image
                  src="/favicon.ico"
                  alt="RailBook"
                  width={40}
                  height={40}
                  className="rounded-xl shadow-sm"
                />
                <span className="text-xl font-bold text-slate-900">
                  RailBook
                </span>
              </div>

              {/* Title — Centered */}
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                  {subtitle}
                </p>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   FEATURE PILL
============================================================ */

function FeaturePill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200 backdrop-blur-md transition hover:bg-white/15 sm:text-sm">
      {icon}
      {label}
    </span>
  );
}