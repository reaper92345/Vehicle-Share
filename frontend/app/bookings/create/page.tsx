"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { SmoothModal, MagneticButton, useNotification } from "../../../components/smoothui";
import { EquipmentTrackingMap, LocationPoint, calculateMobilizationCharge, calculateNepalRoadDistanceKm, DEPOT_ORIGIN } from "../../../components/EquipmentTrackingMap";

interface BookedRange {
  start_date: string;
  end_date: string;
}

interface Equipment {
  id: number | string;
  title: string;
  category: string;
  sub_category?: string;
  description?: string;
  price_per_day: string | number;
  location: string;
  image_url?: string;
  is_available: boolean;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  booked_dates?: BookedRange[];
}

function CreateBookingContent() {
  const router = useRouter();
  const { success, error: notifyError, warning: notifyWarning } = useNotification();
  const searchParams = useSearchParams();
  const equipmentId = searchParams.get("equipment_id");

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ full_name?: string; name?: string; email?: string; user_type?: string; role?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [deploymentLocation, setDeploymentLocation] = useState("Kathmandu Ring Road Project Site");
  const [transportDistanceKm, setTransportDistanceKm] = useState(18);
  const [transportationFee, setTransportationFee] = useState(9500);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Today's date formatted as YYYY-MM-DD for min date constraints
  const today = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  // Check authentication & load user info (proactively checking expiration)
  useEffect(() => {
    const storedToken = localStorage.getItem("equipshare_token");
    if (storedToken) {
      try {
        const decoded: any = jwtDecode(storedToken);
        if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
          // Token is already expired! Clear it so user can cleanly log in again
          localStorage.removeItem("equipshare_token");
          localStorage.removeItem("equipshare_user");
          setToken(null);
          setUser(null);
          setError("Your login session has expired. Please log in again to book.");
          return;
        }
      } catch (_) {
        // Corrupted token
        localStorage.removeItem("equipshare_token");
        localStorage.removeItem("equipshare_user");
        setToken(null);
        setUser(null);
        return;
      }
    }
    setToken(storedToken);

    const storedUser = localStorage.getItem("equipshare_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (_) {}
    }
  }, []);

  // Fetch equipment details
  useEffect(() => {
    if (!equipmentId) {
      setError("No equipment selected. Please browse the catalog to choose an item to rent.");
      setLoading(false);
      return;
    }

    const fetchEquipment = async () => {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const storedToken = localStorage.getItem("equipshare_token");

      try {
        const headers: Record<string, string> = {};
        if (storedToken) {
          headers.Authorization = `Bearer ${storedToken}`;
        }

        const res = await fetch(`${apiUrl}/api/equipment/${equipmentId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          const eq = data.equipment || data;
          setEquipment(eq);

          if (!eq.is_available) {
            setError("This equipment is currently marked as unavailable for rent.");
          }
        } else {
          setError("Unable to find the specified equipment listing.");
        }
      } catch (e) {
        setError("Network error while loading equipment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [equipmentId]);

  // Calculate rental duration in days
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return 0;
    }
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  // Calculate estimated total price including transportation mobilization
  const rentalBasePrice = useMemo(() => {
    if (!equipment || rentalDays <= 0) return 0;
    const daily = Number(equipment.price_per_day) || 0;
    return daily * rentalDays;
  }, [equipment, rentalDays]);

  const estimatedPrice = useMemo(() => {
    return rentalBasePrice + transportationFee;
  }, [rentalBasePrice, transportationFee]);

  // Check if selected dates conflict with existing approved/active bookings
  const dateConflict = useMemo(() => {
    if (!equipment?.booked_dates || !startDate || !endDate || rentalDays <= 0) {
      return null;
    }
    for (const b of equipment.booked_dates) {
      const bStart = b.start_date.slice(0, 10);
      const bEnd = b.end_date.slice(0, 10);
      if (startDate <= bEnd && endDate >= bStart) {
        return { start: bStart, end: bEnd };
      }
    }
    return null;
  }, [equipment, startDate, endDate, rentalDays]);

  // Determine user role compatibility
  const userRole = (user?.user_type || user?.role || "").toLowerCase();
  const isOwnerOnly = userRole === "owner";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const currentToken = localStorage.getItem("equipshare_token");
    if (!currentToken) {
      setToken(null);
      setError("Please log in to submit a rental booking request.");
      return;
    }

    // Check token expiration locally before request
    try {
      const decoded: any = jwtDecode(currentToken);
      if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("equipshare_token");
        localStorage.removeItem("equipshare_user");
        setToken(null);
        setUser(null);
        setError("Your session has expired. Please log in again to complete your booking.");
        return;
      }
    } catch (_) {}

    if (isOwnerOnly) {
      setError("Your account is registered as an Owner only. Only Renters can request bookings.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (rentalDays <= 0) {
      setError("End date must be on or after the start date.");
      return;
    }

    if (dateConflict) {
      setError(`The equipment is already reserved from ${dateConflict.start} to ${dateConflict.end}. Please choose different dates.`);
      return;
    }

    if (!termsAccepted) {
      setShowTerms(true);
      return;
    }

    setSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    try {
      const res = await fetch(`${apiUrl}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          equipment_id: Number(equipmentId),
          start_date: startDate,
          end_date: endDate,
          terms_accepted: true,
          deployment_location: deploymentLocation.trim() || undefined,
        }),
      });

      if (res.ok) {
        success(
          "Booking Request Submitted!",
          `Your reservation for ${equipment?.title} at ${deploymentLocation} (${transportDistanceKm} km) is pending owner approval.`,
          {
            label: "View All Bookings",
            onClick: () => router.push("/bookings"),
          }
        );
        router.push("/bookings");
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          // Token is expired or invalid on the backend
          localStorage.removeItem("equipshare_token");
          localStorage.removeItem("equipshare_user");
          setToken(null);
          setUser(null);
          setError("Your session has expired or is invalid. Please log in again to complete your booking.");
        } else if (res.status === 409) {
          setError(errData.error || "This equipment is already booked for the selected date range.");
        } else if (res.status === 403) {
          setError(errData.error || "You do not have permission to book equipment.");
        } else {
          setError(errData.error || "Failed to create booking. Please check details and try again.");
        }
      }
    } catch (e) {
      setError("Network error while submitting booking request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Navigation Header */}
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
            <Link href="/equipment" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              Browse Equipment
            </Link>
            <Link href="/bookings" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              My Bookings
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content Container */}
      <div className="mx-auto max-w-5xl px-6 py-4">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/equipment" className="hover:underline">Catalog</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Book Equipment</span>
        </nav>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start justify-between">
            <div>
              <p className="font-semibold">Notice</p>
              <p className="mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 text-xs font-bold ml-4">
              ✕
            </button>
          </div>
        )}

        {/* Authentication Warning / Log In Banner */}
        {!token && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-base">You must be logged in to confirm a booking</p>
                <p className="text-sm text-amber-700 mt-1">
                  Please log in with your renter account to submit this booking request.
                </p>
              </div>
              <Link
                href={`/login?redirect=/bookings/create?equipment_id=${equipmentId || ""}`}
                className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-900 transition whitespace-nowrap"
              >
                Log In to Book
              </Link>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-pulse">
            <div className="md:col-span-7 card p-6 space-y-4">
              <div className="bg-gray-200 h-64 w-full rounded-xl" />
              <div className="bg-gray-200 h-6 w-3/4 rounded" />
              <div className="bg-gray-200 h-4 w-1/2 rounded" />
              <div className="bg-gray-200 h-16 w-full rounded" />
            </div>
            <div className="md:col-span-5 card p-6 space-y-4">
              <div className="bg-gray-200 h-6 w-1/2 rounded" />
              <div className="bg-gray-200 h-10 w-full rounded" />
              <div className="bg-gray-200 h-10 w-full rounded" />
              <div className="bg-gray-200 h-24 w-full rounded" />
            </div>
          </div>
        )}

        {/* Missing Equipment Fallback */}
        {!loading && !equipment && (
          <div className="card p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-500 mb-4">
              🚜
            </div>
            <h2 className="text-xl font-bold text-slate-800">No Equipment Selected</h2>
            <p className="text-slate-600 mt-2 max-w-md mx-auto">
              Please browse our available agricultural and construction equipment to pick the item you wish to rent.
            </p>
            <Link href="/equipment" className="btn-primary mt-6 inline-block">
              Browse Equipment Catalog
            </Link>
          </div>
        )}

        {/* Two-Column Booking Layout */}
        {!loading && equipment && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Equipment Showcase Card */}
            <div className="md:col-span-7 card overflow-hidden">
              <div className="relative h-64 sm:h-72 w-full bg-slate-100">
                {equipment.image_url ? (
                  <img
                    src={equipment.image_url}
                    alt={equipment.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
                    <span className="text-4xl">🚜</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="rounded-full bg-brand-700/90 text-white backdrop-blur-sm px-3 py-1 text-xs font-semibold shadow">
                    {equipment.category}
                  </span>
                  {equipment.sub_category && (
                    <span className="rounded-full bg-white/90 text-slate-800 backdrop-blur-sm px-3 py-1 text-xs font-medium shadow">
                      {equipment.sub_category}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{equipment.title}</h1>
                    <p className="mt-1 flex items-center text-sm text-slate-500">
                      <span className="mr-1">📍</span>
                      {equipment.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">Daily Rate</p>
                    <p className="text-2xl font-black text-brand-700">रु{Number(equipment.price_per_day).toLocaleString()}</p>
                    <span className="text-xs text-slate-400">/ day</span>
                  </div>
                </div>

                {(equipment.owner_name || equipment.owner_email) && (
                  <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-600 space-y-1">
                    <p><span className="font-semibold text-slate-700">Owner:</span> {equipment.owner_name}</p>
                    {equipment.owner_phone && <p>Phone: {equipment.owner_phone}</p>}
                    {equipment.owner_email && <p>Email: {equipment.owner_email}</p>}
                  </div>
                )}

                {equipment.description && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Equipment Details
                    </h3>
                    <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                      {equipment.description}
                    </p>
                  </div>
                )}

                {/* Known Reserved Date Ranges */}
                {equipment.booked_dates && equipment.booked_dates.length > 0 && (
                  <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                      Upcoming Booked Dates
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {equipment.booked_dates.map((b, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"
                        >
                          📅 {b.start_date.slice(0, 10)} to {b.end_date.slice(0, 10)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Map Live Tracking & Transit Fee Calculator */}
                <div className="mt-6">
                  <EquipmentTrackingMap
                    equipmentTitle={equipment.title}
                    equipmentCategory={equipment.category}
                    selectedDestinationName={deploymentLocation}
                    onDestinationChange={(site, distKm, fee) => {
                      setDeploymentLocation(site.name);
                      setTransportDistanceKm(distKm);
                      setTransportationFee(fee);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Reservation & Live Price Calculation Form */}
            <div className="md:col-span-5 card p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Reserve Equipment</h2>
              <p className="text-xs text-slate-500 mb-6">Select your requested rental dates below.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate && e.target.value > endDate) {
                        setEndDate(e.target.value);
                      }
                    }}
                    className="input"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    min={startDate || today}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                {/* Overlap Conflict Notice */}
                {dateConflict && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    ⚠️ Selected dates overlap with an existing booking ({dateConflict.start} to {dateConflict.end}). Please adjust your dates.
                  </div>
                )}

                {/* Live Cost Estimation Box */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 mt-4">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Duration:</span>
                    <span className="font-semibold text-slate-800">
                      {rentalDays > 0 ? `${rentalDays} day${rentalDays > 1 ? "s" : ""}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Daily Rate:</span>
                    <span>रु{Number(equipment.price_per_day).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Machine Rental Subtotal:</span>
                    <span className="font-semibold text-slate-800">रु{rentalBasePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 border-t border-slate-200/60 pt-1.5">
                    <span>Mobilization & Haulage ({transportDistanceKm} km):</span>
                    <span className="font-semibold text-brand-700">+ रु{transportationFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-bold text-slate-900">
                    <span>Estimated Total:</span>
                    <span className="text-base text-brand-700">
                      रु{estimatedPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Deployment location (optional)
                  </label>
                  <input
                    type="text"
                    value={deploymentLocation}
                    onChange={(e) => setDeploymentLocation(e.target.value)}
                    placeholder="Project site / job location"
                    className="input"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500 cursor-pointer"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                      />
                      <span className="leading-relaxed">
                        I confirm that I have reviewed and agree to the{" "}
                        <button
                          type="button"
                          className="font-bold text-brand-700 underline hover:text-brand-900 inline"
                          onClick={() => setShowTerms(true)}
                        >
                          EquipShare Rental Agreement & Terms
                        </button>
                        .
                      </span>
                    </label>
                  </div>
                  {!termsAccepted && (
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 hover:text-brand-900 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100"
                    >
                      <span>📜</span>
                      <span>Review Terms & Conditions (Required before booking)</span>
                    </button>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={submitting || rentalDays <= 0 || !!dateConflict || !equipment.is_available}
                  className={`btn-primary w-full mt-4 flex items-center justify-center gap-2 ${
                    submitting || rentalDays <= 0 || !!dateConflict || !equipment.is_available
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {submitting ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Submitting Request...</span>
                    </>
                  ) : !equipment.is_available ? (
                    "Equipment Unavailable"
                  ) : !termsAccepted && rentalDays > 0 ? (
                    "Review Terms & Request Booking"
                  ) : rentalDays > 0 ? (
                    `Request Booking • रु${estimatedPrice.toLocaleString()}`
                  ) : (
                    "Select Dates to Book"
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/equipment"
                    className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
                  >
                    ← Back to Equipment Catalog
                  </Link>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Terms & Conditions Modal using SmoothModal */}
      <SmoothModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        title="EquipShare Rental Agreement & Terms"
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Please carefully review the following policies and liabilities prior to requesting machinery rental.
          </p>

          <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-3.5 text-xs text-slate-700 leading-relaxed border-y border-slate-100 py-3">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs">
                <span>🔍</span> 1. Machinery Condition on Handover & Inspection
              </h4>
              <p>
                The hire customer is obligated to thoroughly inspect the machine at the designated project site/depot upon delivery. Pre-existing wear, fluid leaks, structural damage, or missing attachments must be recorded in writing with photographs prior to operation. Operating the machine constitutes acceptance of its sound working order.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs">
                <span>⛽</span> 2. Fuel Policy & Certified Operator Liability
              </h4>
              <p>
                Equipment is delivered with a documented fuel level and must be returned with an equivalent level; refueling surcharges apply otherwise. Only certified, licensed heavy-machinery operators may handle the equipment. The hire customer assumes full legal and financial liability for operator negligence, project-site safety infractions, and third-party damages.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs">
                <span>🛡️</span> 3. Security Deposit & Return Delay Penalties
              </h4>
              <p>
                Equipment owners reserve the right to request a refundable damage deposit. Delays past the agreed end date without approved extensions will incur a daily penalty rate of the base daily fee plus 20%, along with any associated dispatch/standby recovery costs.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs">
                <span>⏱️</span> 4. Cancellation & Refund Policy
              </h4>
              <p>
                Cancellations requested prior to owner approval are 100% free with no penalty. Cancellations made more than 48 hours prior to start date receive a 50% refund. Cancellations made inside 48 hours or after equipment mobilization are non-refundable.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs">
                <span>🧾</span> 5. Payment Confirmation & Electronic Invoice Receipt
              </h4>
              <p>
                Rental transactions are processed in Nepalese Rupees (NPR रु) via secure QR payment settlement. Upon payment confirmation, an official invoice receipt detailing the rental timeline, equipment specifications, and transaction ID is automatically delivered to the hire customer's registered email.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 text-xs text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-emerald-400 text-brand-700 focus:ring-brand-500 cursor-pointer"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span className="font-medium leading-relaxed">
              I have read, understood, and accept the EquipShare Rental Agreement & Terms in full.
            </span>
          </label>

          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              onClick={() => setShowTerms(false)}
            >
              Close
            </button>
            <MagneticButton
              disabled={!termsAccepted}
              onClick={() => setShowTerms(false)}
              className="btn-primary text-xs py-2 px-5 rounded-xl"
            >
              Confirm Agreement & Continue
            </MagneticButton>
          </div>
        </div>
      </SmoothModal>
    </main>
  );
}

export default function CreateBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-12 text-center text-slate-500">Loading booking page...</div>}>
      <CreateBookingContent />
    </Suspense>
  );
}
