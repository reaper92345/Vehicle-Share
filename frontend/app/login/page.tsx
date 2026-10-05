"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("equipshare_token", data.token);
        localStorage.setItem("equipshare_user", JSON.stringify(data.user));
        router.push("/equipment");
        return;
      }
      setError(data.error || "Login failed");
    } catch (err) {
      setError("Network error. Is backend server running on port 4000?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12">
      <div className="mb-6 w-full max-w-md">
        <Link href="/" className="text-sm font-semibold text-brand-700 hover:underline">
          &larr; Back to Home
        </Link>
      </div>

      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-slate-600">Sign in to manage rentals and equipment listings.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
            <input className="input" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-brand-700 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
