import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  TrainFront,
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
        {/* Left */}
        <div className="hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-bold text-white"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
                <TrainFront size={21} />
              </div>

              RailBook
            </Link>

            <div className="mt-24 max-w-lg">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-red-400">
                Smart railway booking
              </p>

              <h1 className="text-5xl font-bold leading-tight text-white">
                Your journey starts with a single click.
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-400">
                Search trains, manage passengers,
                review bookings and simulate your
                complete railway booking experience.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-500">
            <ShieldCheck size={17} />
            Secure frontend demo environment
          </div>
        </div>

        {/* Right */}
        <div className="flex min-h-screen flex-col">
          <div className="p-5 sm:p-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-red-600"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-5 pb-10 sm:px-8">
            <div className="w-full max-w-md">
              {/* Mobile logo */}
              <div className="mb-8 flex items-center gap-2 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white">
                  <TrainFront size={21} />
                </div>

                <span className="text-xl font-bold text-slate-900">
                  RailBook
                </span>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900">
                  {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
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