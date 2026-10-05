"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    user_type: "renter",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! Please login.");
        router.push("/login");
        return;
      }
      setError(data.error || "Registration failed");
    } catch (err) {
      setError("Network error. Is backend server running on port 4000?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12">
      <div className="mb-6 w-full max-w-xl">
        <Link href="/" className="text-sm font-semibold text-brand-700 hover:underline">
          &larr; Back to Home
        </Link>
      </div>

      <div className="card w-full max-w-xl p-8">
        <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-2 text-slate-600">Join EquipShare as a renter, owner, or both.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
            <input className="input" placeholder="Rajesh Kumar" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
            <input className="input" type="email" placeholder="name@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
            <input className="input" placeholder="+91 9876543210" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Account Type</label>
            <select className="input" value={form.user_type} onChange={(e) => setForm({ ...form, user_type: e.target.value })}>
              <option value="renter">Renter (I want to rent equipment)</option>
              <option value="owner">Owner (I want to list equipment)</option>
              <option value="both">Both (Rent & List)</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </main>
  );
}
