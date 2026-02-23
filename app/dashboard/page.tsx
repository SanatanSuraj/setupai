import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth-options";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">
        Welcome back, {session?.user?.name ?? "User"}.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/roadmap"
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30"
        >
          <h2 className="font-semibold text-foreground">Roadmap</h2>
          <p className="mt-1 text-sm text-muted-foreground">Setup timeline and tasks</p>
        </Link>
        <Link
          href="/dashboard/licensing"
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30"
        >
          <h2 className="font-semibold text-foreground">Licensing</h2>
          <p className="mt-1 text-sm text-muted-foreground">Compliance and documents</p>
        </Link>
        <Link
          href="/dashboard/equipment"
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30"
        >
          <h2 className="font-semibold text-foreground">Equipment</h2>
          <p className="mt-1 text-sm text-muted-foreground">Planner and CAPEX</p>
        </Link>
        <Link
          href="/dashboard/staff"
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30"
        >
          <h2 className="font-semibold text-foreground">Staff</h2>
          <p className="mt-1 text-sm text-muted-foreground">Roles and benchmarks</p>
        </Link>
        <Link
          href="/dashboard/qc"
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30"
        >
          <h2 className="font-semibold text-foreground">QC & SOP</h2>
          <p className="mt-1 text-sm text-muted-foreground">Quality control and SOPs</p>
        </Link>
        <Link
          href="/dashboard/finance"
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30"
        >
          <h2 className="font-semibold text-foreground">Finance</h2>
          <p className="mt-1 text-sm text-muted-foreground">CAPEX, OPEX, break-even</p>
        </Link>
        <Link
          href="/dashboard/operations"
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30"
        >
          <h2 className="font-semibold text-foreground">Operations</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sample tracking and TAT</p>
        </Link>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Plan: <span className="font-medium text-foreground">{session?.user?.subscriptionTier ?? "free"}</span>
      </p>
    </div>
  );
}
