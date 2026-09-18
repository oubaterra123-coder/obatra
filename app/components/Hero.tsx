import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-24 md:pb-32 md:pt-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl text-center">
        <div className="mb-7 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
          One AI Workspace for Your Business
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight text-gray-950 md:text-7xl">
          Everything You Need to
          <br />
          <span className="text-blue-600">Create With AI</span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
          Chat, write, create images, analyze PDFs, and translate - all in one
          powerful AI workspace built to help you work smarter.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-xl bg-blue-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
          >
            Get Started Free
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-gray-300 bg-white px-8 py-3.5 font-semibold text-gray-800 transition hover:border-blue-300 hover:text-blue-600"
          >
            Explore AI Tools
          </Link>
        </div>
      </div>
    </section>
  );
}
