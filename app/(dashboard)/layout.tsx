import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      <Sidebar userName={session.user?.name ?? "User"} userEmail={session.user?.email ?? ""} />
      <main className="flex-1 overflow-y-auto print:overflow-visible">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}