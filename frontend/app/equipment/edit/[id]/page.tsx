"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { ArrowLeft, Save, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNotification } from "../../../../components/smoothui";

interface JwtPayload {
  userId: number;
  userType: string;
  email: string;
  iat: number;
  exp: number;
}

interface EquipmentForm {
  title: string;
  category: string;
  sub_category: string;
  description: string;
  price_per_day: string;
  location: string;
  image_url: string;
  is_available: boolean;
}

const FIELD_MAX: Record<string, number> = {
  title: 160,
  sub_category: 100,
  location: 200,
  description: 5000,
};

export default function EditEquipmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success: notifySuccess, error: notifyError } = useNotification();

  const [form, setForm] = useState<EquipmentForm>({
    title: "",
    category: "Construction",
    sub_category: "",
    description: "",
    price_per_day: "",
    location: "",
    image_url: "",
    is_available: true,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  /* ── Auth guard + data fetch ── */
  useEffect(() => {
    const token = localStorage.getItem("equipshare_token");
    if (!token) {
      router.push(`/login?redirect=/equipment/edit/${id}`);
      return;
    }

    let decoded: JwtPayload;
    try {
      decoded = jwtDecode<JwtPayload>(token);
    } catch {
      router.push(`/login?redirect=/equipment/edit/${id}`);
      return;
    }

    if (decoded.userType !== "owner" && decoded.userType !== "both") {
      notifyError("Only equipment owners can edit listings.");
      router.push("/equipment");
      return;
    }

    setAuthChecked(true);

    // Fetch existing equipment data
    const fetchEquipment = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/equipment/${id}`);
        if (!res.ok) {
          notifyError("Equipment not found.");
          router.push("/owner/dashboard");
          return;
        }
        const data = await res.json();
        const eq = data.equipment ?? data;

        // Verify ownership
        if (eq.owner_id !== decoded.userId) {
          notifyError("You can only edit your own listings.");
          router.push("/owner/dashboard");
          return;
        }

        setForm({
          title: eq.title ?? "",
          category: eq.category ?? "Construction",
          sub_category: eq.sub_category ?? "",
          description: eq.description ?? "",
          price_per_day: eq.price_per_day !== undefined ? String(eq.price_per_day) : "",
          location: eq.location ?? "",
          image_url: eq.image_url ?? "",
          is_available: eq.is_available ?? true,
        });
      } catch {
        notifyError("Failed to load equipment data.");
        router.push("/owner/dashboard");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchEquipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ── Validate form ── */
  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!form.title.trim() || form.title.trim().length > FIELD_MAX.title) {
      errors.title = `Title is required and must be ≤ ${FIELD_MAX.title} characters.`;
    }
    if (!["Agriculture", "Construction"].includes(form.category)) {
      errors.category = "Category must be Agriculture or Construction.";
    }
    if (!form.sub_category.trim() || form.sub_category.trim().length > FIELD_MAX.sub_category) {
      errors.sub_category = `Sub-category is required and must be ≤ ${FIELD_MAX.sub_category} characters.`;
    }
    if (form.description && form.description.trim().length > FIELD_MAX.description) {
      errors.description = `Description must be ≤ ${FIELD_MAX.description} characters.`;
    }
    const price = Number(form.price_per_day);
    if (isNaN(price) || price <= 0 || price > 1_000_000_000) {
      errors.price_per_day = "Price per day must be a positive number up to 1,000,000,000.";
    }
    if (!form.location.trim() || form.location.trim().length > FIELD_MAX.location) {
      errors.location = `Location is required and must be ≤ ${FIELD_MAX.location} characters.`;
    }
    if (form.image_url && form.image_url.trim().length > 0) {
      try {
        const url = new URL(form.image_url);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        errors.image_url = "Image URL must be a valid HTTP/HTTPS URL.";
      }
    }
    return errors;
  }

  /* ── Submit ── */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const token = localStorage.getItem("equipshare_token");
    if (!token) {
      notifyError("Session expired. Please log in again.");
      router.push("/login");
      return;
    }

    try {
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        category: form.category,
        sub_category: form.sub_category.trim(),
        description: form.description.trim(),
        price_per_day: Number(form.price_per_day),
        location: form.location.trim(),
        is_available: form.is_available,
      };
      if (form.image_url.trim()) {
        body.image_url = form.image_url.trim();
      }

      const res = await fetch(`${apiUrl}/api/equipment/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        notifySuccess("Listing updated successfully!");
        router.push("/owner/dashboard");
        return;
      }

      if (res.status === 403) {
        notifyError("You can only edit your own listings.");
      } else {
        notifyError(data.error || "Failed to update equipment listing.");
      }
    } catch {
      notifyError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Loading states ── */
  if (!authChecked || fetchLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading equipment data…</p>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Nav */}
      <header className="mx-auto max-w-4xl px-6 py-6">
        <nav className="flex items-center justify-between rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.05),0_4px_12px_-2px_rgba(0,0,0,0.05)]">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-lg font-bold text-white">
              E
            </div>
            <div>
              <p className="font-semibold text-[#171717]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>EquipShare</p>
              <p className="text-xs text-slate-500">Rent heavy equipment smarter</p>
            </div>
          </Link>
          <Link
            href="/owner/dashboard"
            className="flex items-center gap-1.5 rounded-xl border border-black/5 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-2xl px-6">
        {/* Page heading */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-[#171717] tracking-tight"
            style={{ fontFamily: "'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}
          >
            Edit Listing
          </h1>
          <p className="mt-1.5 text-sm text-[#737373]">
            Update your equipment information. Changes go live immediately after saving.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-[0_1px_2px_0_rgba(0,0,0,0.05),0_4px_12px_-2px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#171717]">Equipment Title</label>
              <input
                className="input w-full"
                placeholder="e.g. Caterpillar 390F Excavator"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              {fieldErrors.title && <FieldError msg={fieldErrors.title} />}
            </div>

            {/* Category + Sub-category */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#171717]">Category</label>
                <select
                  className="input w-full"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="Agriculture">Agriculture</option>
                  <option value="Construction">Construction</option>
                </select>
                {fieldErrors.category && <FieldError msg={fieldErrors.category} />}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#171717]">Sub-Category</label>
                <input
                  className="input w-full"
                  placeholder="e.g. Excavators, Graders"
                  value={form.sub_category}
                  onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
                  required
                />
                {fieldErrors.sub_category && <FieldError msg={fieldErrors.sub_category} />}
              </div>
            </div>

            {/* Price + Location */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#171717]">Price Per Day (रु)</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="5000"
                  min={1}
                  value={form.price_per_day}
                  onChange={(e) => setForm({ ...form, price_per_day: e.target.value })}
                  required
                />
                {fieldErrors.price_per_day && <FieldError msg={fieldErrors.price_per_day} />}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#171717]">Location / City</label>
                <input
                  className="input w-full"
                  placeholder="e.g. Kathmandu"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
                {fieldErrors.location && <FieldError msg={fieldErrors.location} />}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#171717]">Image URL</label>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  className="input flex-1"
                  placeholder="https://images.unsplash.com/..."
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />
              </div>
              {fieldErrors.image_url && <FieldError msg={fieldErrors.image_url} />}
              {form.image_url && !fieldErrors.image_url && (
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="mt-3 h-44 w-full rounded-xl object-cover border border-black/5"
                />
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#171717]">Description</label>
              <textarea
                className="input h-32 w-full resize-none"
                placeholder="Detail the specs, capacity, attachments, and usage notes…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              {fieldErrors.description && <FieldError msg={fieldErrors.description} />}
            </div>

            {/* Availability toggle */}
            <div className="flex items-center justify-between rounded-xl border border-black/5 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#171717]">Available for Rent</p>
                <p className="text-xs text-[#737373] mt-0.5">
                  {form.is_available
                    ? "This machine is listed and renters can book it."
                    : "This machine is hidden from the marketplace."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, is_available: !form.is_available })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  form.is_available ? "bg-brand-700" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    form.is_available ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
              <Link
                href="/owner/dashboard"
                className="flex items-center gap-1.5 rounded-xl border border-black/5 bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Info callout */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <p>
            Only your own listings can be edited. The backend verifies ownership before applying any changes.
          </p>
        </div>
      </div>
    </main>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-700">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {msg}
    </p>
  );
}

