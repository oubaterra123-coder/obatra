export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started.",
      features: [
        "AI Chat",
        "AI Writer",
        "20 requests/day",
      ],
      button: "Start Free",
    },
    {
      name: "Pro",
      price: "$19",
      description: "Best for creators and freelancers.",
      features: [
        "Unlimited AI Chat",
        "AI Image Generator",
        "PDF AI",
        "Priority Support",
      ],
      button: "Upgrade",
      featured: true,
    },
    {
      name: "Business",
      price: "Custom",
      description: "For teams and companies.",
      features: [
        "Unlimited Usage",
        "Team Workspace",
        "API Access",
        "Dedicated Support",
      ],
      button: "Contact Sales",
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-4xl font-bold">
          Simple Pricing
        </h2>

        <p className="mt-4 text-center text-gray-600">
          Choose the plan that fits your needs.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-8 shadow-lg ${
                plan.featured
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >
              <h3 className="text-3xl font-bold">
                {plan.name}
              </h3>

              <p className="mt-4 text-5xl font-extrabold">
                {plan.price}
              </p>

              <p
                className={`mt-4 ${
                  plan.featured
                    ? "text-blue-100"
                    : "text-gray-600"
                }`}
              >
                {plan.description}
              </p>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature}>✅ {feature}</li>
                ))}
              </ul>

              <button
                className={`mt-10 w-full rounded-xl py-3 font-semibold ${
                  plan.featured
                    ? "bg-white text-blue-600"
                    : "bg-blue-600 text-white"
                }`}
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}