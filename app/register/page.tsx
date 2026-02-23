"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [labType, setLabType] = useState("basic");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          organizationName: orgName || undefined,
          labType: labType || "basic",
          city: city || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        setLoading(false);
        return;
      }
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        setError("Account created. Please log in.");
        setLoading(false);
        router.push("/login");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-muted/30">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Get started with SetupAI.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password (min 8 characters)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label htmlFor="orgName" className="block text-sm font-medium text-foreground">
              Organization / Lab name (optional)
            </label>
            <input
              id="orgName"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. City Diagnostics"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="labType" className="block text-sm font-medium text-foreground">
                Lab type
              </label>
              <select
                id="labType"
                value={labType}
                onChange={(e) => setLabType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
              >
                <option value="basic">Basic</option>
                <option value="medium">Medium</option>
                <option value="advanced">Advanced</option>
                <option value="clinic_lab">Clinic + Lab</option>
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-foreground">
                City (optional)
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
