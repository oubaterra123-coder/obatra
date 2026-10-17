import Sidebar from "../components/dashboard/Sidebar";
import MobileBackButton from "../components/dashboard/MobileBackButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar />
      <section className="min-w-0 flex-1">
        <MobileBackButton />
        {children}
      </section>
    </div>
  );
}
