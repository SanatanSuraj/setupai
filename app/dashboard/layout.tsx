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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background">{children}</main>
      <GamifiedGuide />
    </div>
  );
}
