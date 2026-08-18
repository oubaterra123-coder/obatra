"use client";

import Link from "next/link";

export default function ProCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
          ×
        </div>

        <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
          Payment cancelled
        </h1>

        <p className="mt-4 text-gray-600">
          Your payment was cancelled. No subscription was activated.
        </p>

        <Link
          href="/dashboard/settings/pro"
          className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Back to Pro
        </Link>
      </div>
    </main>
  );
}
