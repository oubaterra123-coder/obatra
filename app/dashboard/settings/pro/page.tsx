"use client";

import { useState } from "react";
import Link from "next/link";
import PayPalCardFields from "./PayPalCardFields";

export default function ProPage() {
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "card" | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayPalCheckout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.approveUrl) {
        throw new Error(data.error || "Unable to start secure checkout.");
      }

      window.location.href = data.approveUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/settings"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Back to Settings
        </Link>

        <div className="mt-8 overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
          <div className="bg-blue-600 px-8 py-12 text-center text-white sm:px-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl">
              👑
            </div>

            <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-blue-100">
              Obatra Pro
            </p>

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Unlock more power
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
              Get higher limits, faster AI access, and more capacity across your Obatra workspace.
            </p>
          </div>

          <div className="grid gap-8 p-8 lg:grid-cols-2 lg:p-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Everything in Pro
              </h2>

              <ul className="mt-6 space-y-4">
                {[
                  "Everything in Free",
                  "Higher daily AI limits",
                  "Priority AI access",
                  "Faster generations",
                  "More workspace capacity",
                  "Priority support",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-700">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Pro Plan
              </p>

              <div className="mt-4">
                <span className="text-5xl font-extrabold text-gray-900">$19</span>
                <span className="text-gray-500"> / month</span>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-500">
                Choose your preferred payment method.
              </p>

              <div className="mt-7 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("paypal");
                    setError("");
                  }}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition ${paymentMethod === "paypal" ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🅿️</span>
                    <div>
                      <p className="font-bold text-gray-900">PayPal</p>
                      <p className="text-sm text-gray-500">Pay with your PayPal account</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("card");
                    setError("");
                  }}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition ${paymentMethod === "card" ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="font-bold text-gray-900">Credit / Debit Card</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard and supported cards</p>
                    </div>
                  </div>
                </button>
              </div>

              {paymentMethod === "paypal" && (
                <div>
                  <button
                    type="button"
                    onClick={handlePayPalCheckout}
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Connecting to Secure Checkout..." : "Continue with PayPal"}
                  </button>

                  {error && (
                    <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      {error}
                    </p>
                  )}
                </div>
              )}

              {paymentMethod === "card" && (
                <PayPalCardFields />
              )}

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
                <span>🔒</span>
                <span>Secure payment</span>
                <span>•</span>
                <span>PayPal</span>
                <span>•</span>
                <span>Cards when available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
