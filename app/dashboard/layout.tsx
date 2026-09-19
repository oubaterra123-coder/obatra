import ConversationSidebar from "../components/dashboard/ConversationSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-gray-100">
      <div className="hidden lg:block shrink-0">
        <ConversationSidebar />
      </div>

      <section className="min-w-0 flex-1 overflow-y-auto">
        {children}
      </section>
    </main>
  );
}
