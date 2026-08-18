"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProSuccessPage() {
  const [status, setStatus] = useState("Processing payment...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function capturePayment() {
      try {
        const params = new URLSearchParams(window.location.search);
        const orderID = params.get("token");

        if (!orderID) {
          setError("PayPal order ID is missing.");
          setStatus("");
          return;
        }

        const response = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderID }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Payment could not be completed.");
        }

        setStatus("Payment completed successfully!");
      } catch (err) {
        console.error("PAYPAL SUCCESS ERROR:", err);
        setStatus("");
        setError(
          err instanceof Error ? err.message : "Payment failed."
        );
      }
    }

    capturePayment();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
          {error ? "!" : "✓"}
        </div>

        <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
          {error ? "Payment problem" : "Obatra Pro"}
        </h1>

        {status && (
          <p className="mt-4 text-gray-600">{status}</p>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

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
