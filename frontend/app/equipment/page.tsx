"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import RenterDashboard from "./components/RenterDashboard";
// Removed renter.css import to avoid conflicts

interface Equipment {
  id: string;
  title: string;
  category: string;
  sub_category: string;
  description: string;
  price_per_day: string;
  location: string;
  image_url: string;
  is_available: boolean;
  owner_name?: string;
}

export default function EquipmentListPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [activeTab, setActiveTab] = useState<"equipment" | "renter">("equipment");
  const [user, setUser] = useState<{ name?: string; email?: string; image?: string; role?: string } | null>(null);
  const router = useRouter();

  // Load logged‑in user info
  useEffect(() => {
    const stored = localStorage.getItem("equipshare_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (_) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("equipshare_token");
    localStorage.removeItem("equipshare_user");
    setUser(null);
    router.push("/");
  };

  // State for toggling role display on avatar click
  const [showRole, setShowRole] = useState(false);

  // Helper to get user initial
  const getInitial = () => {
    if (!user) return "U";
    if (user.name?.trim().length) return user.name.trim()[0].toUpperCase();
    if (user.email?.trim().length) return user.email.trim()[0].toUpperCase();
    return "U";
  };

  const fetcher = (url: string) =>
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => data.equipment);

  const queryParams = new URLSearchParams();
  if (category) queryParams.append("category", category);
  if (location) queryParams.append("location", location);
  if (search) queryParams.append("search", search);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/equipment?${queryParams.toString()}`;
  const { data: equipmentList = [], error, isLoading, mutate } = useSWR<Equipment[]>(apiUrl, fetcher, { revalidateOnFocus: false });

  // Re‑fetch when filters change
  useEffect(() => {
    mutate();
  }, [category, location, search]);

  // Render tab navigation – show Renter tab only for renter/admin roles
  // Show Renter tab unconditionally; RenterDashboard component will handle auth/role checks
  const canSeeRenterTab = true;

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
          <div className="flex items-center gap-4">
            <Link href="/equipment/create" className="btn-primary" title="Add new equipment listing">List Equipment</Link>
            {user ? (
              <>
                <div className="flex items-center gap-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-sm font-medium text-slate-700">
                    {getInitial()}
                  </div>
                </div>
                <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-red-600 hover:underline">Logout</button>
              </>
            ) : (
              <Link href="/login" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900" title="Login to your account">Login</Link>
            )}
          </div>
        </nav>
      </header>

      {/* Tab selector */}
      <div className="mx-auto max-w-7xl px-6 py-4 flex space-x-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === "equipment" ? "bg-brand-700 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("equipment")}
        >
          Equipment List
        </button>
        {canSeeRenterTab && (
          <button
            className={`px-4 py-2 rounded ${activeTab === "renter" ? "bg-brand-700 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("renter")}
          >
            Renter Dashboard
          </button>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === "equipment" ? (
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Browse Equipment</h1>
              <p className="mt-1 text-slate-600">Find agricultural and construction gear available for rent.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="Search keyword..." className="input max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
              <input type="text" placeholder="City/Location..." className="input max-w-xs" value={location} onChange={(e) => setLocation(e.target.value)} />
              <select className="input max-w-xs" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Construction">Construction</option>
              </select>
              <button type="button" className="btn-primary" onClick={() => mutate()} title="Refresh listings based on filters">Filter</button>
            </div>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card flex flex-col overflow-hidden animate-pulse">
                  <div className="bg-gray-200 h-48 w-full" />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-gray-200 h-4 w-1/3 rounded" />
                      <span className="bg-gray-200 h-4 w-1/4 rounded" />
                    </div>
                    <div className="bg-gray-200 h-5 w-2/3 rounded mb-2" />
                    <div className="bg-gray-200 h-3 w-full rounded mb-4" />
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                      <div>
                        <div className="bg-gray-200 h-3 w-1/2 rounded" />
                        <div className="bg-gray-200 h-4 w-1/3 rounded mt-1" />
                      </div>
                      <div className="bg-gray-200 h-8 w-20 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Equipment list */}
          {!isLoading && equipmentList && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {equipmentList.map((item) => (
                <div key={item.id} className="card flex flex-col overflow-hidden">
                  <img src={item.image_url} alt={item.title} className="h-48 w-full object-cover" />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{item.category}</span>
                      <span className="text-xs font-medium text-slate-500">{item.location}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description}</p>
                    <div className="mt-auto pt-4">
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-xs text-slate-500">Price per day</p>
                          <p className="text-xl font-bold text-slate-900">रु{item.price_per_day}</p>
                        </div>
                        <Link href="/login" className="btn-primary text-xs" title="Book this equipment">Book Now</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Renter Dashboard tab
        <RenterDashboard />
      )}
    </main>
  );
}