import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/favicon.ico"
              alt="RailBook"
              width={32}
              height={32}
              className="rounded-lg"
            />

            <div>
              <div className="font-bold text-slate-900">RailBook</div>
              <p className="mt-0.5 text-sm text-slate-500">
                Train booking simulation for frontend assessment.
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            © 2026 RailBook. Demo application.
          </p>
        </div>
      </div>
    </footer>
  );
}