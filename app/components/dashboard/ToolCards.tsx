import Link from "next/link";

const tools = [
  {
    title: "AI Chat",
    description: "Chat with Gemini AI",
    href: "/dashboard/chat",
    color: "bg-blue-600",
  },
  {
    title: "Image Generator",
    description: "Generate AI images",
    href: "/dashboard/image",
    color: "bg-purple-600",
  },
  {
    title: "Article Writer",
    description: "Write SEO articles",
    href: "/dashboard/writer",
    color: "bg-green-600",
  },
  {
    title: "Translator",
    description: "Translate any language",
    href: "/dashboard/translate",
    color: "bg-orange-600",
  },
];

export default function ToolCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {tools.map((tool) => (
        <Link
          key={tool.title}
          href={tool.href}
          className={`${tool.color} rounded-xl p-6 text-white transition-transform duration-300 hover:scale-105`}
        >
          <h2 className="text-xl font-bold">{tool.title}</h2>
          <p className="mt-2 opacity-90">{tool.description}</p>
        </Link>
      ))}
    </div>
  );
}