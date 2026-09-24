import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
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
              className="inline-flex items-center gap-2.5 text-xl font-bold text-white"
            >
              <Image
                src="/favicon.ico"
                alt="RailBook"
                width={40}
                height={40}
                className="rounded-xl"
              />

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
          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
            <div className="w-full max-w-md">
              {/* Mobile logo */}
              <div className="mb-8 flex items-center gap-2.5 lg:hidden">
                <Image
                  src="/favicon.ico"
                  alt="RailBook"
                  width={40}
                  height={40}
                  className="rounded-xl"
                />

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