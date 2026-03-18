"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Microscope, Shield, TrendingUp, Award, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-5">
      {/* Logo */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 shadow-md shadow-blue-200/60 mb-4">
          <Microscope size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your SetupAI account</p>
      </div>

      {/* Form card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-base"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-base pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center py-2.5 mt-1"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-500">
        No account?{" "}
        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  );
}

const FEATURES = [
  { icon: Shield,     label: "Compliance Tracking",   desc: "BMW, CEA, NABL all in one place" },
  { icon: TrendingUp, label: "AI-Powered Roadmap",    desc: "Personalized 60-day setup plan" },
  { icon: Award,      label: "NABL Accreditation",    desc: "ISO 15189:2022 readiness tracking" },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-[#0d1117] flex-col justify-between p-10">
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-14">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <Microscope size={14} className="text-white" />
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">SetupAI</span>
          </div>

          <h2 className="text-2xl font-semibold text-white leading-tight">
            India&apos;s smartest<br />
            diagnostic lab<br />
            <span className="text-blue-400">setup platform</span>
          </h2>
          <p className="text-white/40 mt-4 text-sm leading-relaxed">
            From licensing to NABL accreditation, SetupAI guides every step of building your diagnostic lab.
          </p>

          <div className="mt-10 space-y-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-center gap-3.5 p-3.5 bg-white/[0.04] rounded-xl border border-white/[0.07]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/20">
                    <Icon size={15} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">{f.label}</p>
                    <p className="text-xs text-white/30 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/20">
          Trusted by diagnostic labs across India
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-[#f7f8fa]">
        <Suspense
          fallback={
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm animate-pulse">
              <div className="h-6 w-40 bg-slate-200 rounded-full mb-4" />
              <div className="h-10 bg-slate-100 rounded-xl mb-3" />
              <div className="h-10 bg-slate-100 rounded-xl mb-4" />
              <div className="h-11 bg-slate-200 rounded-xl" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
