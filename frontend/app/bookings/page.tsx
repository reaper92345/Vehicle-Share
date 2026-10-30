"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AnimatedTabs } from "../../components/smoothui/AnimatedTabs";
import { MagneticButton } from "../../components/smoothui/MagneticButton";
import { TiltCard } from "../../components/smoothui/TiltCard";

interface Booking {
  id: string | number;
  equipment_id: string | number;
  equipment_title: string;
  location?: string;
  image_url?: string;
  owner_name?: string;
  renter_name?: string;
  renter_email?: string;
  renter_phone?: string;
  price_per_day?: string | number;
  start_date: string;
  end_date: string;
  total_price: string | number;
  status: "Pending" | "Approved" | "Active" | "Completed" | "Cancelled" | string;
  payment_status: "paid" | "unpaid" | string;
  created_at?: string;
}

export default function BookingsPage() {
  const [renterBookings, setRenterBookings] = useState<Booking[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ role?: string; user_type?: string; name?: string; full_name?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"owner" | "renter">("owner");

  // Status update state (for owner approving/rejecting)
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // QR Payment modal state (for renters paying)
  const [activePaymentBooking, setActivePaymentBooking] = useState<Booking | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState<{ invoiceNo?: string; emailSent?: boolean; previewUrl?: string } | null>(null);

  const userRole = (user?.role || user?.user_type || "").toLowerCase();
  const isOwner = ["owner", "both", "admin"].includes(userRole);
  // Do NOT fall back to renter when role is unknown — wait for /api/auth/me response
  const isRenter = ["renter", "both", "admin"].includes(userRole);

  // Fetch both renter bookings and owner incoming requests
  const fetchAllBookings = async () => {
    const storedToken = localStorage.getItem("equipshare_token");
    setToken(storedToken);

    const storedUser = localStorage.getItem("equipshare_user");
    let parsedUser = null;
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (_) {}
    }

    if (!storedToken) {
      setLoading(false);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const headers = { Authorization: `Bearer ${storedToken}` };

    try {
      // Always fetch fresh user data from server to get accurate role
      // (localStorage may have stale/missing role from old sessions)
      try {
        const resMe = await fetch(`${apiUrl}/api/auth/me`, { headers });
        if (resMe.ok) {
          const meData = await resMe.json();
          const freshUser = meData.user || meData;
          // Normalise: ensure role field is always present
          freshUser.role = freshUser.role || freshUser.user_type;
          parsedUser = freshUser;
          setUser(freshUser);
          localStorage.setItem("equipshare_user", JSON.stringify(freshUser));
        } else if (resMe.status === 401) {
          localStorage.removeItem("equipshare_token");
          localStorage.removeItem("equipshare_user");
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }
      } catch (_) {
        // If /me fails (network), fall back to cached parsedUser
      }

      const roleStr = (parsedUser?.role || parsedUser?.user_type || "").toLowerCase();

      // Fetch Renter bookings (what I rented)
      const resRenter = await fetch(`${apiUrl}/api/bookings/me`, { headers });
      if (resRenter.ok) {
        const data = await resRenter.json();
        setRenterBookings(Array.isArray(data) ? data : data.bookings || []);
      } else if (resRenter.status === 401) {
        localStorage.removeItem("equipshare_token");
        localStorage.removeItem("equipshare_user");
        setToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      // Fetch Owner bookings (requests for my equipment)
      const resOwner = await fetch(`${apiUrl}/api/bookings/owner/dashboard`, { headers });
      if (resOwner.ok) {
        const dataOwner = await resOwner.json();
        const ownerList = Array.isArray(dataOwner) ? dataOwner : dataOwner.bookings || [];
        setOwnerBookings(ownerList);

        // Smart default tab selection:
        if (roleStr === "owner" || (ownerList.length > 0 && roleStr !== "renter")) {
          setActiveTab("owner");
        } else if (roleStr === "renter") {
          setActiveTab("renter");
        }
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  // Owner action: Approve or Reject a booking request
  const handleUpdateStatus = async (bookingId: string | number, nextStatus: "Approved" | "Cancelled") => {
    setUpdatingId(bookingId);
    setActionError(null);
    setActionSuccess(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    try {
      const res = await fetch(`${apiUrl}/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setActionSuccess(`Booking request ${nextStatus.toLowerCase()} successfully.`);
        // Refresh bookings
        await fetchAllBookings();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setActionError(err.error || `Failed to set status to ${nextStatus}.`);
      }
    } catch (e) {
      setActionError("Network error while updating booking status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Renter action: QR payment modal
  const handleOpenPayment = async (booking: Booking) => {
    setActivePaymentBooking(booking);
    setQrDataUrl(null);
    setPaymentError(null);
    setPaymentSuccess(false);
    setReceiptInfo(null);
    setLoadingQr(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    try {
      const res = await fetch(`${apiUrl}/api/payments/${booking.id}/qr`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setQrDataUrl(data.qrDataUrl);
      } else {
        const err = await res.json().catch(() => ({}));
        setPaymentError(err.error || "Failed to generate QR payment code.");
      }
    } catch (e) {
      setPaymentError("Network error while generating QR code.");
    } finally {
      setLoadingQr(false);
    }
  };

  // Mock Confirm payment action
  const handleConfirmPayment = async () => {
    if (!activePaymentBooking) return;
    setConfirmingPayment(true);
    setPaymentError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    try {
      const res = await fetch(`${apiUrl}/api/payments/${activePaymentBooking.id}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setPaymentSuccess(true);
        setReceiptInfo({
          invoiceNo: data.invoiceNo,
          emailSent: Boolean(data.email?.sent),
          previewUrl: data.email?.previewUrl,
        });

        if (data.email?.sent) {
          setActionSuccess(`Payment confirmed! An official tax receipt (#${data.invoiceNo}) has been dispatched to your email.`);
        } else {
          setActionSuccess(`Payment confirmed! Receipt #${data.invoiceNo} generated.`);
        }
        await fetchAllBookings();
        setTimeout(() => {
          setActivePaymentBooking(null);
          setPaymentSuccess(false);
          setReceiptInfo(null);
        }, 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setPaymentError(err.error || "Failed to confirm payment.");
      }
    } catch (e) {
      setPaymentError("Network error while confirming payment.");
    } finally {
      setConfirmingPayment(false);
    }
  };

  // Count pending incoming requests for owner
  const pendingOwnerCount = useMemo(() => {
    return ownerBookings.filter((b) => b.status === "Pending").length;
  }, [ownerBookings]);

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Active":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Completed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "Pending":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const currentBookings = activeTab === "owner" ? ownerBookings : renterBookings;

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
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
            <Link href="/equipment/create" className="btn-primary text-xs" title="List new machinery">
              + List Equipment
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bookings & Requests</h1>
            <p className="mt-1 text-slate-600">
              {activeTab === "owner"
                ? "Review and manage rental requests on your listed equipment."
                : "Track your outgoing equipment rental requests."}
            </p>
          </div>
          <Link href="/equipment" className="btn-primary text-xs whitespace-nowrap self-start sm:self-auto">
            Browse Catalog
          </Link>
        </div>

        {/* Global Notices */}
        {actionSuccess && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            ✓ {actionSuccess}
          </div>
        )}
        {actionError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            ✕ {actionError}
          </div>
        )}

        {/* Not Logged In View */}
        {!token && !loading && (
          <div className="card mt-8 p-10 text-center">
            <p className="text-lg font-medium text-slate-700">Please log in to view your bookings</p>
            <p className="text-sm text-slate-500 mt-1">You need an active session to see booking requests.</p>
            <Link href="/login?redirect=/bookings" className="btn-primary mt-6 inline-block">
              Log In
            </Link>
          </div>
        )}

        {/* Tabs for switching between Owner and Renter views */}
        {token && !loading && (
          <div className="mt-8 mb-6">
            <AnimatedTabs
              activeTab={activeTab}
              onChange={(tab) => setActiveTab(tab)}
              tabs={[
                ...(isOwner
                  ? [
                      {
                        id: "owner" as const,
                        label: "Incoming Requests (My Equipment)",
                        badge: pendingOwnerCount,
                        icon: "🚜",
                      },
                    ]
                  : []),
                ...(isRenter
                  ? [
                      {
                        id: "renter" as const,
                        label: "My Rentals (Booked by Me)",
                        badge: renterBookings.length,
                        icon: "📋",
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card p-6 animate-pulse space-y-3">
                <div className="bg-gray-200 h-5 w-1/3 rounded" />
                <div className="bg-gray-200 h-4 w-1/4 rounded" />
                <div className="bg-gray-200 h-6 w-1/6 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && token && currentBookings.length === 0 && (
          <div className="card mt-4 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl mb-4">
              {activeTab === "owner" ? "🚜" : "📋"}
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {activeTab === "owner" ? "No Incoming Requests" : "No Bookings Yet"}
            </h2>
            <p className="mt-2 text-slate-600 max-w-sm mx-auto">
              {activeTab === "owner"
                ? "You have not received any rental requests for your equipment yet. Make sure your listings are active and competitive!"
                : "You haven't requested any equipment rentals yet. Browse our verified machinery to get started!"}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {activeTab === "owner" ? (
                <Link href="/equipment/create" className="btn-primary inline-block">
                  Add Equipment Listing
                </Link>
              ) : (
                <Link href="/equipment" className="btn-primary inline-block">
                  Explore Equipment Catalog
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Bookings List */}
        {!loading && token && currentBookings.length > 0 && (
          <div className="space-y-4">
            {currentBookings.map((b) => (
              <div
                key={b.id}
                className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition"
              >
                <div className="flex gap-4 items-start">
                  {b.image_url ? (
                    <img
                      src={b.image_url}
                      alt={b.equipment_title}
                      className="h-24 w-24 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl flex-shrink-0">
                      🚜
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-900">{b.equipment_title}</h3>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                      {b.payment_status === "paid" ? (
                        <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-semibold">
                          Paid ✓
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-xs font-medium">
                          Unpaid
                        </span>
                      )}
                    </div>

                    {/* Participant Info */}
                    <div className="text-xs text-slate-500">
                      {activeTab === "owner" ? (
                        <div className="flex flex-wrap items-center gap-2 text-slate-700">
                          <span className="font-semibold">Renter:</span>
                          <span>{b.renter_name || "Renter User"}</span>
                          {b.renter_phone && <span>• 📞 {b.renter_phone}</span>}
                          {b.renter_email && <span>• ✉️ {b.renter_email}</span>}
                        </div>
                      ) : (
                        <div>
                          {b.location && <span>📍 {b.location} • </span>}
                          {b.owner_name && <span>Owner: {b.owner_name}</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-medium text-slate-600 pt-1">
                      <span>
                        📅 {String(b.start_date).slice(0, 10)} to {String(b.end_date).slice(0, 10)}
                      </span>
                    </div>

                    <p className="text-base font-bold text-slate-900 pt-1">
                      Total: <span className="text-brand-700">रु{Number(b.total_price).toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* OWNER ACTION BUTTONS */}
                  {activeTab === "owner" && (
                    <>
                      {b.status === "Pending" ? (
                        <div className="flex gap-2">
                          <MagneticButton
                            onClick={() => handleUpdateStatus(b.id, "Approved")}
                            disabled={updatingId === b.id}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                          >
                            {updatingId === b.id ? "Processing..." : "✓ Approve"}
                          </MagneticButton>
                          <MagneticButton
                            onClick={() => handleUpdateStatus(b.id, "Cancelled")}
                            disabled={updatingId === b.id}
                            className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            ✕ Reject
                          </MagneticButton>
                        </div>
                      ) : b.status === "Approved" ? (
                        <div className="text-right">
                          <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                            Approved
                          </span>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {b.payment_status === "paid" ? "Payment received" : "Awaiting renter payment"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">{b.status}</span>
                      )}
                    </>
                  )}

                  {/* RENTER ACTION BUTTONS */}
                  {activeTab === "renter" && (
                    <>
                      {(b.status === "Approved" || b.status === "Active") && b.payment_status !== "paid" && (
                        <MagneticButton
                          onClick={() => handleOpenPayment(b)}
                          className="btn-primary text-xs py-2 px-4 whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                        >
                          📲 Pay with QR
                        </MagneticButton>
                      )}

                      {b.payment_status === "paid" && (
                        <div className="text-right">
                          <span className="text-xs text-emerald-600 font-semibold">Payment Completed</span>
                          <Link href="/hire/dashboard" className="block text-[11px] text-brand-700 mt-1">View / download receipt</Link>
                        </div>
                      )}

                      {b.status === "Pending" && (
                        <span className="text-xs text-amber-600 font-medium">Awaiting Owner Approval</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Payment Modal */}
      {activePaymentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md p-6 bg-white relative">
            <button
              onClick={() => setActivePaymentBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-slate-900">Scan QR to Pay</h3>
            <p className="text-xs text-slate-500 mt-1">
              Rental for {activePaymentBooking.equipment_title}
            </p>

            <div className="my-6 flex flex-col items-center justify-center">
              {loadingQr ? (
                <div className="h-56 w-56 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
                  <p className="text-xs text-slate-500 mt-3">Generating secure QR code...</p>
                </div>
              ) : qrDataUrl ? (
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <img src={qrDataUrl} alt="Payment QR Code" className="h-56 w-56 object-contain" />
                  </div>
                  <p className="mt-3 text-2xl font-black text-brand-700">
                    रु{Number(activePaymentBooking.total_price).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 text-center max-w-xs">
                    Scan using your mobile banking or digital wallet (eSewa / Khalti / ConnectIPS)
                  </p>
                </div>
              ) : (
                <div className="text-center p-6 text-red-600 text-sm">
                  {paymentError || "Failed to load QR code."}
                </div>
              )}
            </div>

            {paymentSuccess && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-center text-xs text-emerald-800 space-y-1">
                <p className="font-bold text-sm text-emerald-700">✓ Payment Confirmed Successfully!</p>
                <p>
                  Official receipt <strong>#{receiptInfo?.invoiceNo || "INV"}</strong> has been generated and dispatched to your email.
                </p>
                {receiptInfo?.previewUrl && (
                  <p className="pt-1">
                    <a
                      href={receiptInfo.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-brand-700 underline hover:text-brand-900"
                    >
                      🔗 Open Email Preview (Ethereal Mailbox)
                    </a>
                  </p>
                )}
              </div>
            )}

            {/* Mock payment confirmation button */}
            <div className="space-y-2">
              <button
                onClick={handleConfirmPayment}
                disabled={confirmingPayment || paymentSuccess || loadingQr}
                className="btn-primary w-full text-sm"
              >
                {confirmingPayment ? "Verifying Payment..." : paymentSuccess ? "Paid!" : "Simulate Payment Success"}
              </button>
              <button
                type="button"
                onClick={() => setActivePaymentBooking(null)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
