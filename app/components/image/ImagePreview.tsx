import Image from "next/image";

type ImagePreviewProps = {
  image: string;
};

export default function ImagePreview({
  image,
}: ImagePreviewProps) {
  return (
    <div className="mt-10 flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6">
      {image ? (
        <Image
          src={image}
          alt="Generated AI"
          width={800}
          height={800}
          className="h-auto max-h-[500px] w-auto rounded-xl shadow-lg"
          unoptimized
        />
      ) : (
        <p className="text-gray-400">
          Your generated image will appear here.
        </p>
      )}
    </div>
  );
}