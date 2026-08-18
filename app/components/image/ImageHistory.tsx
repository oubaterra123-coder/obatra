import Image from "next/image";

type ImageHistoryProps = {
  history: string[];
  onClear: () => void;
};

export default function ImageHistory({
  history,
  onClear,
}: ImageHistoryProps) {
  if (history.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Image History
        </h2>

        <button
          onClick={onClear}
          className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {history.map((img, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border bg-white shadow"
          >
            <Image
              src={img}
              alt={`History ${index + 1}`}
              width={300}
              height={300}
              className="h-48 w-full object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>
    </section>
  );
}