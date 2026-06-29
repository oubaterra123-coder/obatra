export default function Stats() {
  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "50+", label: "AI Tools" },
    { value: "1M+", label: "Content Generated" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <h3 className="text-4xl font-extrabold text-blue-600">
              {stat.value}
            </h3>
            <p className="mt-2 text-gray-600">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}