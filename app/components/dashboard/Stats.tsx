export default function Stats() {
  const stats = [
    {
      title: "AI Chats",
      value: "24",
      color: "bg-blue-500",
    },
    {
      title: "Articles",
      value: "12",
      color: "bg-green-500",
    },
    {
      title: "Images",
      value: "8",
      color: "bg-purple-500",
    },
    {
      title: "Plan",
      value: "Free",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-2xl bg-white p-6 shadow"
        >
          <div
            className={`mb-4 h-3 w-16 rounded-full ${stat.color}`}
          />

          <h3 className="text-gray-500">{stat.title}</h3>

          <p className="mt-2 text-3xl font-bold">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}