"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MagneticButton,
  TiltCard,
  AnimatedTabs,
  StatWidget,
  useNotification,
} from "../components/smoothui";

interface EquipmentItem {
  id: string | number;
  title: string;
  category: string;
  location: string;
  price_per_day: string | number;
  image_url: string;
  owner_name?: string;
  is_available?: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const { success, info } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [featuredEquipment, setFeaturedEquipment] = useState<EquipmentItem[]>([]);
  const [loadingEquip, setLoadingEquip] = useState(true);
  const [portalTab, setPortalTab] = useState<"hirers" | "listers">("hirers");

  const [user, setUser] = useState<{
    name?: string;
    full_name?: string;
    email?: string;
    role?: string;
    user_type?: string;
  } | null>(null);

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("equipshare_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (_) {}
    }
  }, []);

  // Fetch real featured equipment from backend
  useEffect(() => {
    async function loadFeatured() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      try {
        const res = await fetch(`${apiUrl}/api/equipment`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.equipment || [];
          setFeaturedEquipment(list.slice(0, 6));
        } else {
          // Fallback realistic Nepal machinery
          setFeaturedEquipment(defaultFallbackEquipment);
        }
      } catch (_) {
        setFeaturedEquipment(defaultFallbackEquipment);
      } finally {
        setLoadingEquip(false);
      }
    }
    loadFeatured();
  }, []);

  function handleLogout() {
    localStorage.removeItem("equipshare_token");
    localStorage.removeItem("equipshare_user");
    setUser(null);
    router.push("/");
  }

  const getInitial = () => {
    if (!user) return "U";
    const name = user.full_name || user.name || user.email || "U";
    return name.trim()[0].toUpperCase();
  };

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCity.trim()) params.set("location", selectedCity.trim());
    if (selectedCategory.trim()) params.set("category", selectedCategory.trim());

    router.push(`/equipment?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md shadow-xs">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-lg font-black text-white shadow-md shadow-brand-700/20 group-hover:scale-105 transition-transform">
              E
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 leading-tight">EquipShare</p>
              <p className="text-[11px] text-slate-500 font-medium">Nepal Heavy Equipment Marketplace</p>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
            <Link href="/equipment" className="hover:text-brand-700 transition">
              Browse Catalog
            </Link>
            <Link href="/hire/dashboard" className="hover:text-brand-700 transition">
              Hire Portal
            </Link>
            <Link href="/owner/dashboard" className="hover:text-brand-700 transition">
              Lister Portal
            </Link>
            <Link href="/bookings" className="hover:text-brand-700 transition">
              Bookings & Requests
            </Link>
            <a href="#how-it-works" className="hover:text-brand-700 transition">
              How It Works
            </a>
            <a href="#compliance" className="hover:text-brand-700 transition flex items-center gap-1 text-slate-500">
              <span>VAT: 610394821</span>
            </a>
          </div>

          {/* Right Profile / Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={["owner", "both", "admin"].includes((user.role || user.user_type || "").toLowerCase()) ? "/owner/dashboard" : "/hire/dashboard"}
                  className="flex items-center gap-2 rounded-xl bg-slate-100 py-1.5 px-3 border border-slate-200 hover:bg-slate-200/70 transition"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                    {getInitial()}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                    {user.full_name || user.name || "Account"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline px-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link href="/register">
                  <MagneticButton className="btn-primary text-xs py-2 px-4 rounded-xl shadow-sm">
                    Get Started
                  </MagneticButton>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 pt-12 pb-20">
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3.5 py-1 text-xs font-bold text-brand-800 shadow-2xs">
                <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
                <span>Nepal's Premier Peer-to-Peer Heavy & Farm Equipment Network</span>
              </div>

              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
                Rent verified machinery for your project in <span className="text-brand-700">hours</span>, not days.
              </h1>

              <p className="mt-5 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                Direct access to hydraulic excavators, motor graders, power tillers, and concrete mixers. Transparent daily pricing in NPR, verified operators, and instant tax-compliant invoices.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/equipment">
                  <MagneticButton className="btn-primary px-7 py-3.5 text-sm rounded-xl shadow-md shadow-brand-700/20 flex items-center gap-2">
                    <span>🚜 Explore Catalog</span>
                  </MagneticButton>
                </Link>
                <Link href="/equipment/create">
                  <MagneticButton className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 text-sm rounded-xl shadow-md flex items-center gap-2">
                    <span>💰 List Your Equipment</span>
                  </MagneticButton>
                </Link>
              </div>

              {/* Trust & Proof Metrics */}
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-slate-200/80 pt-6">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">रु 2.4M+</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Rental Volume Settled</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">100%</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Verified Machine Hosts</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-brand-700">7 Provinces</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Nepal-Wide Coverage</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Hero Showcase */}
            <div className="lg:col-span-5">
              <TiltCard className="relative rounded-3xl bg-white p-5 shadow-2xl border border-slate-200/80">
                <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src="https://www.volvoce.com/-/media/aprimo/images/crawler-excavators/ec950f/volvo-find-crawler-excavator-ec950f-t4f-stagev-1000x1000.avif?mh=942&mw=937&v=u-h_Pw&c=1&cw=937&ch=624&fp=1&f=avif&q=56&hash=281899DD9E9A86A72CDB1E85D897B92B"
                    alt="Featured Excavator EC950F"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-brand-700/90 text-white backdrop-blur-md px-3 py-1 text-xs font-bold shadow-sm">
                    Featured Asset
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-full bg-emerald-600/90 text-white backdrop-blur-md px-3 py-1 text-xs font-bold shadow-sm flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    Available in Bhaktapur
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Volvo EC950F Heavy Excavator</h3>
                      <p className="text-xs text-slate-500 mt-0.5">📍 Jagati, Bhaktapur · Construction & Mining</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium">Daily Rate</p>
                      <p className="text-xl font-black text-brand-700">रु 40,000</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href="/equipment" className="flex-1">
                      <MagneticButton className="btn-primary w-full text-xs py-2.5 rounded-xl">
                        View Machinery Specs
                      </MagneticButton>
                    </Link>
                  </div>
                </div>
              </TiltCard>
            </div>

          </div>
        </div>
      </section>

      {/* Multi-Parameter Smart Search Strip */}
      <section className="relative z-20 -mt-7 mx-auto max-w-5xl px-6">
        <form
          onSubmit={handleSearchSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-3"
        >
          {/* Keyword Search */}
          <div className="flex-1 w-full flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 border border-slate-200/80">
            <span className="text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="What equipment do you need? (e.g. Excavator, Mixer, Tiller)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Location Dropdown */}
          <div className="w-full md:w-52 flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 border border-slate-200/80">
            <span className="text-slate-400">📍</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none"
            >
              <option value="">All Locations</option>
              <option value="Bhaktapur">Bhaktapur</option>
              <option value="Kathmandu">Kathmandu</option>
              <option value="Lalitpur">Lalitpur</option>
              <option value="Chitwan">Chitwan</option>
              <option value="Pokhara">Pokhara</option>
              <option value="Butwal">Butwal</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-52 flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 border border-slate-200/80">
            <span className="text-slate-400">⚙️</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="Construction">Construction</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Heavy Duty">Heavy Machinery</option>
            </select>
          </div>

          {/* Search Button */}
          <MagneticButton
            type="submit"
            className="w-full md:w-auto btn-primary whitespace-nowrap px-6 py-2.5 text-xs sm:text-sm rounded-xl font-bold"
          >
            Find Equipment
          </MagneticButton>
        </form>
      </section>

      {/* Featured Fleet Inventory Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
              <span>★</span>
              <span>Available on EquipShare</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
              Featured Machinery Fleet
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Verified construction and farming equipment ready for site dispatch.
            </p>
          </div>
          <Link href="/equipment" className="text-xs font-bold text-brand-700 hover:text-brand-900 hover:underline flex items-center gap-1">
            <span>View All Equipment ({featuredEquipment.length}+)</span>
            <span>→</span>
          </Link>
        </div>

        {loadingEquip ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card p-5 animate-pulse space-y-3">
                <div className="h-44 w-full bg-slate-200 rounded-xl" />
                <div className="h-5 w-1/2 bg-slate-200 rounded" />
                <div className="h-4 w-1/3 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEquipment.map((item) => (
              <TiltCard key={item.id} className="card flex flex-col justify-between overflow-hidden group hover:shadow-xl transition">
                <div>
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 text-white backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold">
                      {item.category}
                    </span>
                    <span className="absolute bottom-3 right-3 rounded-full bg-emerald-600/90 text-white backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold">
                      Available
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <span>📍</span> {item.location}
                      {item.owner_name && <span>· Owner: {item.owner_name}</span>}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Rental Rate</p>
                        <p className="text-lg font-black text-brand-700">
                          रु {Number(item.price_per_day).toLocaleString()}
                          <span className="text-xs font-normal text-slate-500">/day</span>
                        </p>
                      </div>
                      <Link href={`/bookings/create?equipment_id=${item.id}`}>
                        <MagneticButton className="btn-primary text-xs py-2 px-3.5 rounded-xl">
                          Reserve Now
                        </MagneticButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </section>

      {/* Dual Value Propositions: Hirers vs Machine Owners (SmoothUI AnimatedTabs) */}
      <section className="bg-white py-20 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-black text-slate-900">
              Built for Contractors, Farmers & Machinery Owners
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Select your perspective to discover how EquipShare solves heavy machinery challenges in Nepal.
            </p>

            <div className="mt-6 flex justify-center">
              <AnimatedTabs
                activeTab={portalTab}
                onChange={(tab) => setPortalTab(tab)}
                tabs={[
                  { id: "hirers" as const, label: "For Equipment Hirers (Renters)", icon: "🏗️" },
                  { id: "listers" as const, label: "For Equipment Owners (Listers)", icon: "🚜" },
                ]}
              />
            </div>
          </div>

          {portalTab === "hirers" ? (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-xl text-brand-700 font-bold">
                  ⚡
                </div>
                <h3 className="text-lg font-bold text-slate-900">Instant Machinery Access</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Eliminate multi-crore capital expenses. Rent modern excavators, graders, and tractors exactly when your job site needs them.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-xl text-brand-700 font-bold">
                  🧾
                </div>
                <h3 className="text-lg font-bold text-slate-900">Official IRD Tax Invoices</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Receive verifiable 13% VAT Tax Invoices with PAN: 610394821 immediately upon QR payment, 100% compliant with Nepal Inland Revenue laws.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-xl text-brand-700 font-bold">
                  🛡️
                </div>
                <h3 className="text-lg font-bold text-slate-900">Legally Protected Handover</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Every booking enforces standardized Terms & Conditions covering operator liability, pre-delivery machine condition, and return policies.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-xl text-brand-700 font-bold">
                  💰
                </div>
                <h3 className="text-lg font-bold text-slate-900">Turn Idle Equipment into Income</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Don't let multi-million rupee machinery sit idle in your depot. Earn steady monthly rental revenue from verified project contractors.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-xl text-brand-700 font-bold">
                  📊
                </div>
                <h3 className="text-lg font-bold text-slate-900">Live Telematics & Analytics</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Manage your entire fleet from the modernized Lister Dashboard with return countdown monitors, revenue charts, and project site tracking.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-xl text-brand-700 font-bold">
                  ✅
                </div>
                <h3 className="text-lg font-bold text-slate-900">Complete Booking Approval Control</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  You decide who rents your machines. Review renter identities, project site locations, and approve or reject requests with one click.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Visual "How It Works" Section */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Transparent & Fast</p>
          <h2 className="mt-1 text-3xl font-black text-slate-900">How EquipShare Works</h2>
          <p className="mt-2 text-sm text-slate-600">Rent or monetize machinery across Nepal in 4 simple steps.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {[
            {
              step: "01",
              title: "Discover Machinery",
              desc: "Filter by location, daily rates, and machinery type. Compare specifications and real machine photos.",
              icon: "🔍",
            },
            {
              step: "02",
              title: "Review & Agree to Terms",
              desc: "Select dates and project site. Review standardized rental agreements covering inspection and operator safety.",
              icon: "📜",
            },
            {
              step: "03",
              title: "Owner Approves & QR Pay",
              desc: "The owner approves your request. Settle securely via mobile banking QR (Fonepay/eSewa/ConnectIPS).",
              icon: "📲",
            },
            {
              step: "04",
              title: "Site Delivery & Tax Receipt",
              desc: "Receive the machine at your project site. An official IRD Tax Invoice (#INV) is emailed to you instantly.",
              icon: "🚜",
            },
          ].map((item) => (
            <div key={item.step} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-3xl font-black text-slate-200 absolute top-4 right-4">{item.step}</span>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statutory Trust & IRD VAT Compliance Ribbon */}
      <section id="compliance" className="bg-slate-900 text-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-800/60 p-8 sm:p-10 backdrop-blur-md">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs font-bold">
                  ✓ Registered Under Nepal Inland Revenue Department (IRD)
                </span>
                <h3 className="mt-4 text-2xl sm:text-3xl font-black text-white">
                  Legally Registered & 100% Tax Compliant
                </h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-2xl">
                  EquipShare Marketplace Nepal operates in full compliance with the Nepal Value Added Tax (VAT) Act 2052. Every transaction generates an authentic commercial tax invoice with transparent 13% VAT for corporate tax filing.
                </p>

                <div className="mt-6 flex flex-wrap gap-6 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-400 block font-medium">VAT / PAN NUMBER</span>
                    <strong className="text-white text-sm font-mono">610394821</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">COMPANY REGISTRATION</span>
                    <strong className="text-white text-sm font-mono">284910/080/081</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">CENTRAL OFFICE</span>
                    <strong className="text-white text-sm">Jagati-7, Bhaktapur, Nepal</strong>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-center">
                <div className="h-16 w-16 rounded-full border-2 border-emerald-400/60 flex items-center justify-center text-2xl mb-3">
                  🛡️
                </div>
                <h4 className="text-sm font-bold text-white">Verified Machine Guarantee</h4>
                <p className="text-xs text-slate-400 mt-1">Pre-delivery checklist & standardized damage deposit protection.</p>
                <Link href="/privacy" className="mt-4 text-xs font-semibold text-brand-400 hover:underline">
                  Review Platform Terms & Privacy →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Support Section */}
      <section id="contact" className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            
            {/* Contact Info Left */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Get in Touch</p>
                <h2 className="mt-1 text-3xl font-black text-slate-900">
                  We're here to help your project succeed.
                </h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Have questions about equipment rates, machine mobilization, or listing your fleet? Our local team in Bhaktapur is ready to assist.
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-lg text-brand-700">
                    📍
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-sm">Headquarters & Depot</strong>
                    <p className="text-slate-600 mt-0.5">
                      EquipShare Marketplace Nepal Pvt. Ltd.<br />
                      Jagati-7, Bhaktapur, Bagmati Province, Nepal
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-lg text-brand-700">
                    📞
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-sm">Direct Phone & Support Hotline</strong>
                    <p className="text-slate-600 mt-0.5">
                      +977-1-6612345 (Office)<br />
                      +977-9801234567 (24/7 Breakdown & Mobilization)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-lg text-brand-700">
                    ✉️
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-sm">Email Inquiries</strong>
                    <p className="text-slate-600 mt-0.5">
                      Support: <a href="mailto:support@equipshare.com" className="text-brand-700 font-semibold hover:underline">support@equipshare.com</a><br />
                      Tax & Invoicing: <a href="mailto:billing@equipshare.com" className="text-brand-700 font-semibold hover:underline">billing@equipshare.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact / Inquiry Form Right */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 sm:p-9 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">Send an Instant Machinery Inquiry</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Leave your project details and our mobilization team will respond within 2 hours.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    success(
                      "Inquiry Submitted Successfully!",
                      "Our machine dispatch manager at Jagati Depot will contact you within 2 hours."
                    );
                    (e.target as HTMLFormElement).reset();
                  }}
                  className="mt-6 space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Shrestha"
                        className="input bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+977-98XXXXXXXX"
                        className="input bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="ramesh@company.com"
                        className="input bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Project Location / City</label>
                      <input
                        type="text"
                        placeholder="e.g. Bhaktapur, Kathmandu, Pokhara"
                        className="input bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Required Machinery / Equipment & Dates
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Specify machine type (Excavator, Grader, Power Tiller), estimated start date, and rental duration..."
                      className="input bg-white text-xs leading-relaxed"
                    />
                  </div>

                  <div className="pt-2">
                    <MagneticButton
                      type="submit"
                      className="btn-primary w-full py-3 text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-brand-700/20"
                    >
                      🚀 Submit Machinery Inquiry
                    </MagneticButton>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 py-8 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-black text-white">
              E
            </div>
            <div>
              <p className="font-semibold text-slate-200">EquipShare Marketplace Nepal Pvt. Ltd.</p>
              <p className="text-[11px] text-slate-400">Jagati-7, Bhaktapur, Nepal · PAN / VAT: 610394821</p>
            </div>
          </div>

          <p className="text-slate-400 text-[11px]">
            © {new Date().getFullYear()} EquipShare Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

// Fallback realistic Nepal equipment
const defaultFallbackEquipment: EquipmentItem[] = [
  {
    id: "1",
    title: "Volvo EC950F Crawler Heavy Excavator",
    category: "Construction",
    location: "Jagati, Bhaktapur",
    price_per_day: 40000,
    image_url:
      "https://www.volvoce.com/-/media/aprimo/images/crawler-excavators/ec950f/volvo-find-crawler-excavator-ec950f-t4f-stagev-1000x1000.avif?mh=942&mw=937&v=u-h_Pw&c=1&cw=937&ch=624&fp=1&f=avif&q=56&hash=281899DD9E9A86A72CDB1E85D897B92B",
    owner_name: "Rajendra Tahamata",
    is_available: true,
  },
  {
    id: "2",
    title: "SDLG Motor Grader G9290H",
    category: "Construction",
    location: "Bhaktapur, Jagati",
    price_per_day: 60000,
    image_url:
      "https://sdlg-www-hk-1318570787.cos.ap-hongkong.myqcloud.com/website/2026/01/26/fc6fc6102334476da1a9d4637f968ee0.png",
    owner_name: "Rajendra Tahamata",
    is_available: true,
  },
  {
    id: "3",
    title: "Heavy Duty Power Tiller 12HP (Multi-Tool)",
    category: "Agriculture",
    location: "Kathmandu Valley",
    price_per_day: 3500,
    image_url:
      "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1200&q=80",
    owner_name: "Kathmandu Agri Hub",
    is_available: true,
  },
];
