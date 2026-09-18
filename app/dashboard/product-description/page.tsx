"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProductDescriptionPage() {
  const [image, setImage] = useState<File | null>(null);
  const [details, setDetails] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateDescription() {
    if (!image) {
      alert("Please upload a product image.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("Please log in first.");
        return;
      }

      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const base64 = String(reader.result).split(",")[1];

          const response = await fetch("/api/product-description", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              imageBase64: base64,
              mimeType: image.type,
              productDetails: details,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Generation failed");
          }

          setResult(data.result);
        } catch (error) {
          console.error(error);
          alert("Failed to generate product description.");
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setLoading(false);
        alert("Failed to read image.");
      };

      reader.readAsDataURL(image);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Something went wrong.");
    }
  }

  return (
    <div className="min-h-full p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Product Description
          </h1>
          <p className="mt-2 text-gray-600">
            Upload a product image and let AI create ready-to-use product content.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Product Image
            </h2>

            <label className="flex min-h-48 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-gray-400">
              <div>
                <div className="mb-2 text-4xl">🛍️</div>
                <p className="font-medium text-gray-700">
                  {image ? image.name : "Click to upload an image"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  JPG, PNG or WEBP
                </p>
              </div>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </label>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Optional product details, brand, target audience, etc."
              className="mt-4 min-h-32 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:border-gray-500"
            />

            <button
              onClick={generateDescription}
              disabled={loading || !image}
              className="mt-4 w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Product Description"}
            </button>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              AI Result
            </h2>

            {result ? (
              <div className="whitespace-pre-wrap rounded-xl bg-gray-50 p-5 text-sm leading-7 text-gray-800">
                {result}
              </div>
            ) : (
              <div className="flex min-h-80 items-center justify-center rounded-xl bg-gray-50 text-center text-gray-500">
                Your product description will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
