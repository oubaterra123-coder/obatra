"use client";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/ forever",
    description: "Get started with Obatra and explore every AI tool.",
    features: [
      "AI Chat",
      "AI Writer",
      "AI Images",
      "PDF AI",
      "Translator",
      "Daily usage limits",
    ],
    button: "Start Free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/ month",
    description: "Unlock more power, higher limits, and a better AI workspace.",
    features: [
      "Everything in Free",
      "Higher daily limits",
      "Priority AI access",
      "Faster generations",
      "More workspace capacity",
      "Priority support",
    ],
    button: "Upgrade to Pro",
    featured: true,
  },
  {
    name: "Business",
    price: "Let's talk",
    period: "",
    description: "Flexible AI tools and support for teams and businesses.",
    features: [
      "Everything in Pro",
      "Custom limits",
      "Team workspace",
      "Advanced support",
      "Custom solutions",
      "Contact Sales",
    ],
    button: "Contact Sales",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Pricing
          </p>

          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Simple pricing for everyone
          </h2>

          <p className="mt-5 text-lg text-gray-600">
            Start free and upgrade when you need more power.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                plan.featured
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-200 bg-white text-gray-900 hover:border-blue-200"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold">{plan.name}</h3>

              <div className="mt-5 flex items-end gap-1">
                <span className="text-5xl font-extrabold tracking-tight">
                  {plan.price}
                </span>

                {plan.period && (
                  <span
                    className={`mb-1 text-sm ${
                      plan.featured ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              <p
                className={`mt-4 min-h-[48px] ${
                  plan.featured ? "text-blue-100" : "text-gray-600"
                }`}
              >
                {plan.description}
              </p>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      className={
                        plan.featured ? "text-white" : "text-blue-600"
                      }
                    >
                      ✓
                    </span>

                    <span
                      className={
                        plan.featured ? "text-blue-50" : "text-gray-700"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (plan.button === "Start Free") {
                    window.location.href = "/dashboard";
                  } else if (plan.button === "Upgrade to Pro") {
                    window.location.href = "/dashboard/settings/pro";
                  } else if (plan.button === "Contact Sales") {
                    window.location.href = "/contact";
                  }
                }}
                className={`mt-10 w-full rounded-xl py-3.5 font-semibold transition ${
                  plan.featured
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Free users can try every Obatra tool with daily usage limits.
        </p>
      </div>
    </section>
  );
}

