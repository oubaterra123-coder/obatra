import {
  PenSquare,
  ImageIcon,
  MessageCircle,
  FileText,
  Languages,
} from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "AI Chat",
    description:
      "Ask questions, brainstorm ideas, and get instant AI-powered answers.",
  },
  {
    icon: PenSquare,
    title: "AI Writer",
    description:
      "Create blogs, emails, ads, and professional content in seconds.",
  },
  {
    icon: ImageIcon,
    title: "AI Images",
    description:
      "Turn simple ideas into creative images with AI-powered generation.",
  },
  {
    icon: FileText,
    title: "PDF AI",
    description:
      "Upload a PDF, ask questions, and get answers based on your document.",
  },
  {
    icon: Languages,
    title: "Translator",
    description:
      "Translate your text quickly across different languages with AI.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-semibold text-blue-600">OBATRA AI WORKSPACE</p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Everything you need in one place
          </h2>

          <p className="mt-5 text-lg text-gray-600">
            Chat, write, create images, analyze PDFs, and translate — all from
            one simple AI workspace.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                  <Icon size={28} className="text-blue-600" />
                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {feature.description}
                </p>

                <div className="mt-6 font-semibold text-blue-600">
                  Explore tool →
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
