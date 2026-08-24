"use client";

import { useState } from "react";
import "../globals.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, otp }),
      });
      const data = (await res.json()) as any;

      if (res.ok) {
        window.location.href = "/";
      } else {
        if (data.twoFactorRequired) setTwoFactorRequired(true);
        setError(data.error || "লগইন ব্যর্থ হয়েছে");
      }
    } catch {
      setError("সার্ভার এরর, আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center p-4">
      <div className="max-w-[420px] w-full bg-white rounded-[20px] shadow-[0_24px_80px_rgba(0,0,0,0.07)] p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--ink)] mb-2">মিড-ডে মিল</h1>
          <p className="text-[var(--muted)] text-sm">সিস্টেমে লগইন করুন</p>
        </div>

        {error && (
          <div className="bg-[var(--red-soft)] text-[var(--red)] p-3 rounded-lg text-sm font-semibold mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-xs font-bold text-[var(--muted)]">
            ইউজারনেম / মোবাইল নাম্বার
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[var(--canvas)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green-soft)] transition-all"
              placeholder="ইউজারনেম দিন"
            />
          </label>

          {twoFactorRequired && <label className="flex flex-col gap-1.5 text-xs font-bold text-[var(--muted)]">
            Authenticator code
            <input inputMode="numeric" autoComplete="one-time-code" required value={otp} onChange={(e)=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} className="bg-[var(--canvas)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm text-[var(--ink)]" placeholder="000000" />
          </label>}

          <label className="flex flex-col gap-1.5 text-xs font-bold text-[var(--muted)]">
            পাসওয়ার্ড
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[var(--canvas)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green-soft)] transition-all"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-[var(--green)] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-[var(--green-2)] active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? "অপেক্ষা করুন..." : "লগইন করুন"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[var(--muted)]">
          <p>লগইন তথ্যের জন্য সিস্টেম অ্যাডমিনের সঙ্গে যোগাযোগ করুন।</p>
        </div>
      </div>
    </div>
  );
}
