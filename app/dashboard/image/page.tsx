"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ImageItem = {
  id: string;
  image_url: string;
  prompt: string;
  created_at?: string;
};

const STYLES = [
  "Realistic",
  "Anime",
  "3D Render",
  "Cartoon",
  "Cyberpunk",
  "Oil Painting",
  "Watercolor",
  "Pixel Art",
];

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [image, setImage] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("AUTH ERROR:", error);
          return;
        }

        if (!user) {
          console.error("NO USER LOGGED IN");
          return;
        }

        console.log("IMAGE USER ID:", user.id);

        setUserId(user.id);

        await loadImages(user.id);
      } catch (error) {
        console.error("INIT IMAGE ERROR:", error);
      }
    }

    init();
  }, []);

  async function loadImages(id: string) {
    if (!id) return;

    const { data, error } = await supabase
      .from("images")
      .select("*")
      .eq("user_id", id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("LOAD IMAGES ERROR:", error);
      return;
    }

    console.log("LOADED IMAGES:", data);

    setImages(data || []);
  }

  async function generateImage() {
    if (!prompt.trim()) {
      alert("Please describe the image.");
      return;
    }

    if (!userId) {
      alert("User session is not ready.");
      return;
    }

    setLoading(true);
    setImage("");

    try {
      console.log("GENERATING IMAGE...");

      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          userId,
        }),
      });

      const result = await response.json();

      console.log("IMAGE API RESULT:", result);

      if (!response.ok) {
        throw new Error(
          result.error || "Image generation failed."
        );
      }

      if (!result.image) {
        throw new Error("No image URL returned.");
      }

      setImage(result.image);

      await loadImages(userId);
    } catch (error) {
      console.error("IMAGE GENERATION ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate image."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteImage(id: string) {
    try {
      const response = await fetch(
        "/api/image/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
          }),
        }
      );

      const result = await response.json();

      console.log("DELETE RESULT:", result);

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Delete failed."
        );
      }

      const deletedImage = images.find(
        (item) => item.id === id
      );

      setImages((current) =>
        current.filter((item) => item.id !== id)
      );

      if (deletedImage?.image_url === image) {
        setImage("");
      }
    } catch (error) {
      console.error("DELETE IMAGE ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Delete failed."
      );
    }
  }

  function downloadImage() {
    if (!image) return;

    const link = document.createElement("a");

    link.href = image;
    link.download = "obatra-image.png";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">

        <div>
          <h1 className="text-4xl font-bold">
            AI Image Generator ??
          </h1>

          <p className="mt-2 text-gray-500">
            Create beautiful AI images from text.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border bg-white p-6 shadow">

          <label className="font-semibold">
            Style
          </label>

          <select
            value={style}
            onChange={(event) =>
              setStyle(event.target.value)
            }
            className="mt-3 w-full rounded-xl border p-4"
          >
            {STYLES.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          <label className="mt-5 block font-semibold">
            Prompt
          </label>

          <textarea
            value={prompt}
            onChange={(event) =>
              setPrompt(event.target.value)
            }
            placeholder="Describe your image..."
            className="mt-3 h-40 w-full rounded-xl border p-4 outline-none focus:ring-2"
          />

          <div className="mt-5 flex gap-3">

            <button
              onClick={generateImage}
              disabled={
                loading ||
                !userId ||
                !prompt.trim()
              }
              className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Generating..."
                : "Generate"}
            </button>

            <button
              onClick={downloadImage}
              disabled={!image}
              className="rounded-xl border px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              ?? Download
            </button>

          </div>

          {!userId && (
            <p className="mt-3 text-sm text-gray-500">
              Loading user session...
            </p>
          )}

        </div>

        <div className="mt-10 rounded-2xl border bg-white p-6 shadow">

          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <p className="text-gray-500">
                Generating your image...
              </p>
            </div>
          ) : image ? (
            <img
              src={image}
              alt="Generated AI image"
              className="mx-auto max-h-[600px] rounded-xl object-contain"
            />
          ) : (
            <div className="flex h-96 items-center justify-center text-gray-400">
              Your generated image will appear here.
            </div>
          )}

        </div>

        <section className="mt-12">

          <h2 className="mb-5 text-2xl font-bold">
            My Images ???
          </h2>

          {images.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center text-gray-400">
              No images yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

              {images.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border bg-white p-3 shadow"
                >

                  <img
                    src={item.image_url}
                    alt={item.prompt}
                    className="w-full rounded-lg"
                  />

                  <p className="mt-3 text-sm text-gray-500">
                    {item.prompt}
                  </p>

                  <button
                    onClick={() =>
                      deleteImage(item.id)
                    }
                    className="mt-3 w-full rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
                  >
                    ??? Delete
                  </button>

                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
