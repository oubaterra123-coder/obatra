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
  const [style, setStyle] = useState(STYLES[0]);
  const [image, setImage] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  async function loadImages(id: string) {
    if (!id) return;

    const { data, error } = await supabase
      .from("images")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD IMAGES ERROR:", error);
      return;
    }

    setImages(data || []);
  }

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("No logged-in user.");
        return;
      }

      setUserId(user.id);
      await loadImages(user.id);
    }

    loadUser();
  }, []);

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

    try {
      const res = await fetch("/api/image", {
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

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Image generation failed.");
      }

      setImage(result.image || "");

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
      const res = await fetch("/api/image/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        alert(result.error || "Delete failed.");
        return;
      }

      const deleted = images.find((item) => item.id === id);

      setImages((prev) =>
        prev.filter((item) => item.id !== id)
      );

      if (deleted?.image_url === image) {
        setImage("");
      }
    } catch (error) {
      console.error("DELETE IMAGE ERROR:", error);
      alert("Delete failed.");
    }
  }

  function downloadImage() {
    if (!image) return;

    const a = document.createElement("a");
    a.href = image;
    a.download = "obatra-image.png";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-4xl font-bold">
          AI Image Generator 🎨
        </h1>

        <p className="mt-2 text-gray-500">
          Create beautiful AI images from text.
        </p>

        <div className="mt-8 rounded-2xl border bg-white p-6 shadow">

          <label className="font-semibold">
            Style
          </label>

          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="mt-3 w-full rounded-xl border p-4"
          >
            {STYLES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="mt-5 block font-semibold">
            Prompt
          </label>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your image..."
            className="mt-3 h-40 w-full rounded-xl border p-4"
          />

          <div className="mt-5 flex gap-3">

            <button
              onClick={generateImage}
              disabled={loading || !userId || !prompt.trim()}
              className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate"}
            </button>

            <button
              onClick={downloadImage}
              disabled={!image}
              className="rounded-xl border px-6 py-3 disabled:opacity-50"
            >
              ⬇️ Download
            </button>

          </div>

          {!userId && (
            <p className="mt-3 text-sm text-gray-500">
              Loading user session...
            </p>
          )}

        </div>

        <div className="mt-10 rounded-2xl border bg-white p-6 shadow">

          {image ? (
            <img
              src={image}
              alt="Generated"
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
            My Images 🖼️
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
                  className="rounded-xl border bg-white p-3 shadow"
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
                    onClick={() => deleteImage(item.id)}
                    className="mt-3 w-full rounded-lg bg-red-500 px-4 py-2 text-white"
                  >
                    🗑️ Delete
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