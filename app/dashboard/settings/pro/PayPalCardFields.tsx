"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PayPalCardFields() {
  const [ready, setReady] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const cardFieldsRef = useRef<any>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const expiryRef = useRef<HTMLDivElement>(null);
  const cvvRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function waitForElements() {
      for (let i = 0; i < 50; i++) {
        if (
          numberRef.current &&
          expiryRef.current &&
          cvvRef.current
        ) {
          return true;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return false;
    }

    async function loadPayPal() {
      const clientId =
        process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

      if (!clientId) {
        setMessage("PayPal Client ID is missing.");
        return;
      }

      try {
        const elementsReady = await waitForElements();

        if (!elementsReady || cancelled) {
          setMessage(
            "Card payment fields could not be initialized."
          );
          return;
        }

        const sdkUrl =
          "https://www.paypal.com/sdk/js?" +
          new URLSearchParams({
            "client-id": clientId,
            components: "buttons,card-fields",
            currency: "USD",
            intent: "capture",
          }).toString();

        if (!window.paypal) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.querySelector(
              'script[src*="paypal.com/sdk/js"]'
            ) as HTMLScriptElement | null;

            if (existing) {
              if (window.paypal) {
                resolve();
                return;
              }

              existing.addEventListener(
                "load",
                () => resolve(),
                { once: true }
              );

              existing.addEventListener(
                "error",
                () =>
                  reject(
                    new Error(
                      "PAYPAL SDK SCRIPT FAILED"
                    )
                  ),
                { once: true }
              );

              return;
            }

            const script =
              document.createElement("script");

            script.src = sdkUrl;
            script.async = true;

            script.onload = () => resolve();

            script.onerror = () =>
              reject(
                new Error(
                  "PAYPAL SDK SCRIPT FAILED"
                )
              );

            document.head.appendChild(script);
          });
        }

        if (cancelled) return;

        if (!window.paypal?.CardFields) {
          setMessage(
            "PayPal Card Fields are not available."
          );
          return;
        }

        const cardFields =
          window.paypal.CardFields({
            createOrder: async () => {
              const response = await fetch(
                "/api/paypal/create-order",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                }
              );

              const data =
                await response.json();

              if (
                !response.ok ||
                !data.success ||
                !data.orderID
              ) {
                throw new Error(
                  data.error ||
                    "Unable to create PayPal order."
                );
              }

              return data.orderID;
            },

            onApprove: async (data: any) => {
              try {
                setMessage(
                  "Capturing payment..."
                );

                const {
                  data: {
                    session,
                  },
                  error: sessionError,
                } =
                  await supabase.auth.getSession();

                if (
                  sessionError ||
                  !session?.access_token
                ) {
                  throw new Error(
                    "Your Supabase session has expired. Please log in again."
                  );
                }

                const response =
                  await fetch(
                    "/api/paypal/capture-order",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type":
                          "application/json",
                        Authorization:
                          `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({
                        orderID: data.orderID,
                      }),
                    }
                  );

                const result =
                  await response.json();

                console.log(
                  "PAYPAL CARD CAPTURE RESULT:",
                  result
                );

                if (
                  !response.ok ||
                  !result.success
                ) {
                  throw new Error(
                    result.error ||
                      "Payment capture failed."
                  );
                }

                setMessage(
                  `Payment successful! Pro activated. Order ID: ${result.orderID}`
                );
              } catch (error) {
                console.error(
                  "PAYPAL CARD CAPTURE ERROR:",
                  error
                );

                setMessage(
                  error instanceof Error
                    ? error.message
                    : "Payment capture failed."
                );
              } finally {
                setLoading(false);
              }
            },

            onError: (error: any) => {
              console.error(
                "PAYPAL CARD ERROR:",
                error
              );

              setMessage(
                "Card payment could not be completed."
              );

              setLoading(false);
            },
          });

        const isEligible =
          typeof cardFields.isEligible ===
          "function"
            ? cardFields.isEligible()
            : false;

        console.log(
          "PAYPAL CARD FIELDS ELIGIBLE:",
          isEligible
        );

        if (!isEligible) {
          setEligible(false);

          setMessage(
            "Card payments are not available for this PayPal Sandbox account."
          );

          return;
        }

        await cardFields
          .NumberField()
          .render(
            numberRef.current as HTMLDivElement
          );

        await cardFields
          .ExpiryField()
          .render(
            expiryRef.current as HTMLDivElement
          );

        await cardFields
          .CVVField()
          .render(
            cvvRef.current as HTMLDivElement
          );

        if (cancelled) return;

        cardFieldsRef.current = cardFields;

        setEligible(true);
        setReady(true);
      } catch (error) {
        console.error(
          "PAYPAL CARD LOAD ERROR:",
          error
        );

        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to load card payment."
          );
        }
      }
    }

    loadPayPal();

    return () => {
      cancelled = true;
    };
  }, []);

  async function submitCard() {
    if (
      !cardFieldsRef.current ||
      !ready ||
      loading
    ) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await cardFieldsRef.current.submit();
    } catch (error) {
      console.error(
        "CARD SUBMIT ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Please check your card details and try again."
      );

      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Pay with Card
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Enter your card details securely.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-left text-sm font-medium text-gray-700">
          Card Number
        </label>

        <div
          ref={numberRef}
          id="card-number-field"
          className="min-h-12 rounded-xl border border-gray-200 bg-white p-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-left text-sm font-medium text-gray-700">
          Expiry
        </label>

        <div
          ref={expiryRef}
          id="card-expiry-field"
          className="min-h-12 rounded-xl border border-gray-200 bg-white p-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-left text-sm font-medium text-gray-700">
          CVV
        </label>

        <div
          ref={cvvRef}
          id="card-cvv-field"
          className="min-h-12 rounded-xl border border-gray-200 bg-white p-3"
        />
      </div>

      <button
        type="button"
        onClick={submitCard}
        disabled={!ready || loading}
        className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Processing..."
          : "Pay $19 with Card"}
      </button>

      {message && (
        <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}
