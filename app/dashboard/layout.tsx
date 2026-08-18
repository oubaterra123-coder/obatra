import ConversationSidebar from "../components/dashboard/ConversationSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-gray-100">
      <ConversationSidebar />

      <section className="flex-1 overflow-y-auto">
        {children}
      </section>
    </main>
  );
}