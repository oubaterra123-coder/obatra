type ImageFormProps = {
  prompt: string;
  setPrompt: (value: string) => void;
  loading: boolean;
  onGenerate: () => void;
};

export default function ImageForm({
  prompt,
  setPrompt,
  loading,
  onGenerate,
}: ImageFormProps) {
  return (
    <>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Example: A futuristic city at sunset..."
        className="mt-6 h-40 w-full rounded-xl border border-gray-300 p-4 focus:border-purple-500 focus:outline-none"
      />

      <button
        onClick={onGenerate}
        disabled={loading}
        className="mt-6 rounded-xl bg-purple-600 px-8 py-3 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>
    </>
  );
}