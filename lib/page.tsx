"use client";

import { useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setEmail("");
      } else {
        setMessage({ type: "error", text: data.error || "An error occurred. Please try again." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
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
          <p className="text-slate-500 mt-2 text-sm">Enter your email address to receive a password reset link.</p>
        </div>

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

          {message && (
            <p className={`text-sm font-medium ${message.type === "success" ? "text-emerald-600" : "text-rose-500"}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-violet-600 border border-transparent text-white font-semibold hover:bg-violet-700 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-violet-400 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-6">
          Remembered your password?{" "}
          <Link href="/login" className="text-violet-600 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
