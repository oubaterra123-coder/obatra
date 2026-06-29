import { PenSquare, ImageIcon, MessageCircle } from "lucide-react";

const features = [
  {
    icon: PenSquare,
    title: "AI Writer",
    description: "Generate blogs, emails, ads and marketing content in seconds.",
  },
  {
    icon: ImageIcon,
    title: "AI Image Generator",
    description: "Create professional AI images from simple text prompts.",
  },
  {
    icon: MessageCircle,
    title: "AI Chat",
    description: "Ask questions, brainstorm ideas and get instant answers.",
  },
];

export default function Features() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-4xl font-bold">
          Everything you need in one place
        </h2>

        <p className="mt-4 text-center text-gray-600">
          Powerful AI tools designed for creators, freelancers and businesses.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
              >
                <Icon size={40} className="text-blue-600" />

                <h3 className="mt-6 text-2xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-4 text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}