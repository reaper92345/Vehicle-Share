"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateEquipmentPage() {
  const [form, setForm] = useState({
    title: "",
    category: "Agriculture",
    sub_category: "",
    description: "",
    price_per_day: "",
    location: "",
    image_url: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("equipshare_token");
    if (!token) {
      router.push("/login?redirect=/equipment/create");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Redirecting to login...</p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("equipshare_token");
    if (!token) {
      alert("Please login first to create a listing.");
      router.push("/login");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Equipment listed successfully!");
        router.push("/equipment");
        return;
      }
      setError(data.error || "Failed to create equipment listing");
    } catch (err) {
      setError("Network error connecting to backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <header className="mx-auto max-w-7xl px-6 py-6">
        <nav className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-lg font-bold text-white">E</div>
            <div>
              <p className="text-lg font-semibold text-slate-900">EquipShare</p>
              <p className="text-xs text-slate-500">Rent heavy equipment smarter</p>
            </div>
          </Link>
          <Link href="/equipment" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
            Browse Equipment
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-slate-900">List Your Equipment</h1>
          <p className="mt-2 text-slate-600">Provide details about your machine to start earning rental income.</p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Equipment Title</label>
              <input
                className="input"
                placeholder="e.g. Concrete Mixer 10/7 Cu. Ft."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="Agriculture">Agriculture</option>
                  <option value="Construction">Construction</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Sub-Category</label>
                <input
                  className="input"
                  placeholder="e.g. Mixers, Scaffolding"
                  value={form.sub_category}
                  onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Price Per Day (₹)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="2500"
                  value={form.price_per_day}
                  onChange={(e) => setForm({ ...form, price_per_day: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Location / City</label>
                <input
                  className="input"
                  placeholder="e.g. Pune"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Image URL</label>
              <input
                className="input"
                placeholder="https://images.unsplash.com/..."
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="input h-28 resize-none"
                placeholder="Detail the specs, capacity, and usage instructions..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Publishing listing..." : "Publish Listing"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}