import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { GamifiedGuide } from "@/components/gamified-guide/GamifiedGuide";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      {/* Right content column */}
      <div className="flex flex-1 flex-col min-w-0">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <GamifiedGuide />
    </div>
  );
}
