"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error ?? "Something went wrong. Please try again.";
        const retry = data.retryAfter;
        setError(retry ? `${msg} Try again in ${Math.ceil(retry / 60)} minute(s).` : msg);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto text-violet-600 mb-4 shadow-inner">
          <Package size={32} />
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="text-left space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
              Check your inbox and spam folder.
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:underline"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 text-left">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-sm text-slate-900"
              />
            </div>

            {error && (
              <p className="text-sm text-rose-500 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-violet-600 border border-transparent text-white font-semibold hover:bg-violet-700 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-violet-400 border-t-white rounded-full animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        {!success && (
          <p className="text-sm text-slate-500">
            Remember your password?{" "}
            <Link href="/login" className="text-violet-600 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
