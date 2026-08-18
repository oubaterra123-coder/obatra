export default function Stats() {
  const stats = [
    {
      value: "5",
      label: "AI Tools",
      description: "Powerful tools in one workspace",
    },
    {
      value: "1",
      label: "Workspace",
      description: "Everything organized in one place",
    },
    {
      value: "24/7",
      label: "AI Availability",
      description: "Access your AI tools anytime",
    },
    {
      value: "Free",
      label: "To Get Started",
      description: "Try every tool with daily limits",
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Why Obatra
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need in one place
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            One simple workspace for your everyday AI needs.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-3xl font-extrabold tracking-tight text-blue-600 sm:text-4xl">
                {stat.value}
              </h3>

              <p className="mt-2 font-semibold text-gray-900">
                {stat.label}
              </p>

              <p className="mt-1 text-sm leading-5 text-gray-500">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
