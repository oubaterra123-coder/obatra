"use client";

import Link from "next/link";

const menuItems = [
  {
    name: "AI Chat",
    icon: "🤖",
    path: "/dashboard/chat",
  },
  {
    name: "AI Writer",
    icon: "✍️",
    path: "/dashboard/writer",
  },
  {
    name: "AI Images",
    icon: "🖼️",
    path: "/dashboard/images",
  },
  {
    name: "PDF AI",
    icon: "📄",
    path: "/dashboard/pdf",
  },
  {
    name: "Settings",
    icon: "⚙️",
    path: "/dashboard/settings",
  },
];


export default function Sidebar() {
  return (
    <aside className="h-screen w-64 bg-black p-6 text-white">

      <h1 className="mb-10 text-3xl font-bold">
        Obatra
      </h1>

      <nav className="space-y-3">

        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-800"
          >
            <span>{item.icon}</span>
            {item.name}
          </Link>
        ))}

      </nav>

    </aside>
  );
}