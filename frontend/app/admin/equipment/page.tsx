"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  MagneticButton,
  TiltCard,
  SmoothModal,
  useNotification,
} from "../../../components/smoothui";
import { EquipmentTrackingMap } from "../../../components/EquipmentTrackingMap";

interface Equipment {
  id: number;
  title: string;
  category: string;
  location: string;
  price_per_day?: string | number;
  image_url?: string;
  sub_category?: string;
  description?: string;
  is_available?: boolean;
  owner_name?: string;
  owner_phone?: string;
}

export default function DetailedAdminEquipmentPage() {
  const { success, error: notifyError } = useNotification();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Selected for inspection or telematics map
  const [inspectEquipment, setInspectEquipment] = useState<Equipment | null>(null);
  const [trackEquipment, setTrackEquipment] = useState<Equipment | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const fetchEquipment = async () => {
    setLoading(true);
    const token = localStorage.getItem("equipshare_token");
    try {
      const res = await fetch(`${apiUrl}/api/admin/equipment`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setEquipmentList(Array.isArray(data) ? data : data.equipment || []);
      } else {
        notifyError("Failed to Load Fleet", data.error || "Unable to reach database.");
      }
    } catch (_) {
      notifyError("Network Error", "Could not synchronize machinery inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const filteredEquipment = useMemo(() => {
    const q = search.trim().toLowerCase();
    return equipmentList.filter((eq) => {
      const matchesSearch =
        !q ||
        eq.title.toLowerCase().includes(q) ||
        eq.category.toLowerCase().includes(q) ||
        eq.location.toLowerCase().includes(q) ||
        (eq.owner_name && eq.owner_name.toLowerCase().includes(q));

      const matchesCat =
        categoryFilter === "all" ||
        eq.category.toLowerCase().includes(categoryFilter);

      return matchesSearch && matchesCat;
    });
  }, [equipmentList, search, categoryFilter]);

  const toggleAvailable = async (eq: Equipment) => {
    const token = localStorage.getItem("equipshare_token");
    const nextStatus = !eq.is_available;
    try {
      const res = await fetch(`${apiUrl}/api/admin/equipment/${eq.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_available: nextStatus }),
      });

      if (res.ok) {
        setEquipmentList((prev) =>
          prev.map((item) => (item.id === eq.id ? { ...item, is_available: nextStatus } : item))
        );
        success(
          "Machinery Status Updated",
          `${eq.title} is now marked as ${nextStatus ? "Available for Rent" : "Under Maintenance / Inactive"}.`
        );
      } else {
        notifyError("Update Failed", "Could not update machinery status.");
      }
    } catch (_) {
      notifyError("Network Error", "Failed to update equipment.");
    }
  };

  const deleteEquipment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this machinery listing?")) return;
    const token = localStorage.getItem("equipshare_token");
    try {
      const res = await fetch(`${apiUrl}/api/admin/equipment/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEquipmentList((prev) => prev.filter((item) => item.id !== id));
        success("Machinery Removed", "Equipment asset deleted from platform catalog.");
        setInspectEquipment(null);
      } else {
        notifyError("Delete Failed", "Could not remove equipment.");
      }
    } catch (_) {
      notifyError("Network Error", "Failed to delete equipment.");
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
              National Heavy Fleet & Asset Directory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Machinery Fleet & Rates Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Oversee excavator, grader, and tractor listings, daily rates, depot mobilization, and live availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-1 flex items-center">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 px-3 rounded-lg text-xs font-bold transition ${
                viewMode === "grid" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ⊞ Card Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 px-3 rounded-lg text-xs font-bold transition ${
                viewMode === "table" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ☰ Data Table
            </button>
          </div>
          <MagneticButton
            onClick={fetchEquipment}
            className="btn-secondary text-xs py-2 px-3.5 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-xs"
          >
            🔄 Refresh
          </MagneticButton>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-5 bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Fleet Assets" },
            { id: "construction", label: "Construction Machinery" },
            { id: "agri", label: "Commercial Agriculture" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setCategoryFilter(pill.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                categoryFilter === pill.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by title, location, owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input text-xs max-w-sm"
        />
      </div>

      {/* VIEW MODE 1: CARD GRID */}
      {viewMode === "grid" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEquipment.map((eq) => (
            <TiltCard
              key={eq.id}
              className="card overflow-hidden bg-white border border-slate-200 flex flex-col justify-between group shadow-sm hover:shadow-md transition"
            >
              <div>
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={eq.image_url || "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&q=80"}
                    alt={eq.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 text-white backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold">
                    {eq.category}
                  </span>
                  <span
                    className={`absolute bottom-3 right-3 rounded-full backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold ${
                      eq.is_available ? "bg-emerald-600/90 text-white" : "bg-rose-600/90 text-white"
                    }`}
                  >
                    {eq.is_available ? "Available" : "Maintenance"}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">{eq.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span>📍</span> {eq.location}
                    {eq.owner_name && <span>· Owner: {eq.owner_name}</span>}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Rental Rate</p>
                      <p className="text-base font-black text-brand-700">
                        रु {Number(eq.price_per_day).toLocaleString()}
                        <span className="text-[11px] font-normal text-slate-500">/day</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleAvailable(eq)}
                        className={`text-[10px] font-bold px-2 py-1.5 rounded-lg border transition ${
                          eq.is_available
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {eq.is_available ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => setTrackEquipment(eq)}
                        className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                      >
                        🗺️ GPS
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-0">
                <MagneticButton
                  onClick={() => setInspectEquipment(eq)}
                  className="btn-secondary w-full text-xs py-2 rounded-xl text-center"
                >
                  Inspect Specifications & Depot
                </MagneticButton>
              </div>
            </TiltCard>
          ))}
        </div>
      )}

      {/* VIEW MODE 2: DATA TABLE */}
      {viewMode === "table" && (
        <div className="card overflow-hidden bg-white border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 text-left border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Asset</th>
                  <th className="p-3.5">Sector</th>
                  <th className="p-3.5">Depot Location</th>
                  <th className="p-3.5">Daily Rate</th>
                  <th className="p-3.5">Owner / Lister</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEquipment.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={eq.image_url || "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=400&q=80"}
                          alt={eq.title}
                          className="h-10 w-12 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{eq.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono">ID: #{eq.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-600">{eq.category}</td>
                    <td className="p-3.5 text-slate-700">📍 {eq.location}</td>
                    <td className="p-3.5 font-bold text-brand-700">
                      रु {Number(eq.price_per_day).toLocaleString()}/day
                    </td>
                    <td className="p-3.5 text-slate-600">{eq.owner_name || "Registered Owner"}</td>
                    <td className="p-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          eq.is_available ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {eq.is_available ? "Available" : "Maintenance"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => toggleAvailable(eq)}
                        className="text-[11px] font-bold text-brand-700 hover:underline"
                      >
                        {eq.is_available ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => setTrackEquipment(eq)}
                        className="text-[11px] font-bold text-slate-900 hover:underline"
                      >
                        Track
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Telematics Modal */}
      <SmoothModal
        isOpen={!!trackEquipment}
        onClose={() => setTrackEquipment(null)}
        title={`Live Telematics: ${trackEquipment?.title || "Heavy Machinery"}`}
        className="max-w-3xl"
      >
        {trackEquipment && (
          <div className="space-y-4">
            <EquipmentTrackingMap
              equipmentTitle={trackEquipment.title}
              equipmentCategory={trackEquipment.category}
              selectedDestinationName="Kathmandu Ring Road Project Site"
            />
            <div className="flex justify-end pt-2">
              <MagneticButton
                onClick={() => setTrackEquipment(null)}
                className="btn-primary text-xs py-2 px-4 rounded-xl"
              >
                Close Map
              </MagneticButton>
            </div>
          </div>
        )}
      </SmoothModal>

      {/* Detailed Specs Modal */}
      <SmoothModal
        isOpen={!!inspectEquipment}
        onClose={() => setInspectEquipment(null)}
        title="Equipment File & Maintenance Record"
      >
        {inspectEquipment && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Asset Title:</span>
                <span className="font-bold text-slate-900">{inspectEquipment.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Sector Category:</span>
                <span className="font-semibold text-slate-800">{inspectEquipment.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Depot Hub:</span>
                <span className="font-semibold text-slate-800">{inspectEquipment.location}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Daily Rental Tariff:</span>
                <span className="font-black text-brand-700">रु {Number(inspectEquipment.price_per_day).toLocaleString()}/day</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Owner Identity:</span>
                <span className="font-semibold text-slate-800">{inspectEquipment.owner_name || "Depot Hub"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => deleteEquipment(inspectEquipment.id)}
                className="text-rose-600 hover:text-rose-800 font-bold text-xs"
              >
                🗑️ Permanently Delete Listing
              </button>
              <MagneticButton
                onClick={() => setInspectEquipment(null)}
                className="btn-primary text-xs py-2 px-4 rounded-xl"
              >
                Close
              </MagneticButton>
            </div>
          </div>
        )}
      </SmoothModal>
    </div>
  );
}
