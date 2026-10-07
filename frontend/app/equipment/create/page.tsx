"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

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
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("equipshare_token");
    if (!token) {
      router.push("/login?redirect=/equipment/create");
    } else {
      try {
        const decoded = jwtDecode(token) as any;
        if (decoded.userType !== "owner" && decoded.userType !== "both") {
          alert("Only owners can create equipment listings.");
          router.push("/equipment");
        } else {
          setAuthChecked(true);
        }
      } catch (e) {
        console.error(e);
        router.push("/login?redirect=/equipment/create");
      }
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

    // Front‑end validation (mirrors backend rules)
    const errors: string[] = [];
    const fieldErrorMap: Record<string,string> = {};
    if (!form.title.trim() || form.title.trim().length > 160) {
      const msg = "Title is required and must be ≤ 160 characters.";
      errors.push(msg);
      fieldErrorMap.title = msg;
    }
    const allowedCategories = new Set(["Agriculture", "Construction"]);
    if (!allowedCategories.has(form.category)) {
      const msg = "Category must be Agriculture or Construction.";
      errors.push(msg);
      fieldErrorMap.category = msg;
    }
    if (!form.sub_category.trim() || form.sub_category.trim().length > 100) {
      const msg = "Sub‑category is required and must be ≤ 100 characters.";
      errors.push(msg);
      fieldErrorMap.sub_category = msg;
    }
    if (form.description && form.description.trim().length > 5000) {
      const msg = "Description must be ≤ 5000 characters.";
      errors.push(msg);
      fieldErrorMap.description = msg;
    }
    const price = Number(form.price_per_day);
    if (isNaN(price) || price <= 0 || price > 1_000_000_000) {
      const msg = "Price per day must be a positive number up to 1 000 000 000.";
      errors.push(msg);
      fieldErrorMap.price_per_day = msg;
    }
    if (!form.location.trim() || form.location.trim().length > 200) {
      const msg = "Location is required and must be ≤ 200 characters.";
      errors.push(msg);
      fieldErrorMap.location = msg;
    }
    if (form.image_url && form.image_url.trim().length > 0) {
      try {
        const url = new URL(form.image_url);
        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error();
        }
      } catch (_) {
        const msg = "Image URL must be a valid HTTP/HTTPS URL.";
        errors.push(msg);
        fieldErrorMap.image_url = msg;
      }
    }
    if (errors.length) {
      setError(errors.join(" "));
      setFieldErrors(fieldErrorMap);
      setLoading(false);
      return;
    } else {
      setFieldErrors({});
    }

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
          {/* Header – replace the Next.js Link with an <a> */}
          <div className="flex items-center gap-4">
            <a className="btn-primary" title="Browse equipment listings" href="/equipment" >  List Equipment  </a>

            <Link href="/login" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
              title="Login to your account">  Login </Link>
          </div>

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
                  className="input transition-colors duration-200 focus:bg-gray-100"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="Agriculture">Agriculture</option>
                  <option value="Construction">Construction</option>
                </select>
                {fieldErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Sub-Category</label>
                <input
                  className="input transition-shadow duration-200 focus:shadow-outline"
                  placeholder="e.g. Mixers, Scaffolding"
                  value={form.sub_category}
                  onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
                  required
                />
                {fieldErrors.sub_category && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.sub_category}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Price Per Day (₹)</label>
                <input
                  type="number"
                  className="input transition-shadow duration-200 focus:shadow-outline"
                  placeholder="2500"
                  value={form.price_per_day}
                  onChange={(e) => setForm({ ...form, price_per_day: e.target.value })}
                  required
                />
                {fieldErrors.price_per_day && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.price_per_day}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Location / City</label>
                <input
                  className="input transition-shadow duration-200 focus:shadow-outline"
                  placeholder="e.g. Pune"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
                {fieldErrors.location && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.location}</p>
                )}
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
              {fieldErrors.image_url && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.image_url}</p>
              )}
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="mt-2 max-h-48 rounded shadow" />
              )}
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