"use client";

import React, { useState } from "react";
import { 
  Cpu, 
  MapPin, 
  Layers, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Code2, 
  Calculator,
  Compass
} from "lucide-react";
import { SmoothModal, MagneticButton } from "./smoothui";

interface AlgorithmShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlgorithmShowcaseModal({ isOpen, onClose }: AlgorithmShowcaseModalProps) {
  const [activeAlgo, setActiveAlgo] = useState<"haversine" | "bounding" | "overlap" | "pricing">("haversine");

  // Interactive Live Tester States
  // 1. Haversine Tester
  const [originCity, setOriginCity] = useState("Kathmandu");
  const [destCity, setDestCity] = useState("Pokhara");

  const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    Kathmandu: { lat: 27.7172, lng: 85.3240 },
    Pokhara: { lat: 28.2096, lng: 83.9856 },
    Bhaktapur: { lat: 27.6698, lng: 85.4385 },
    Lalitpur: { lat: 27.6710, lng: 85.3206 },
    Chitwan: { lat: 27.6934, lng: 84.4300 },
    Butwal: { lat: 27.7006, lng: 83.4484 },
    Biratnagar: { lat: 26.4525, lng: 87.2718 },
    Hetauda: { lat: 27.4287, lng: 85.0328 },
    Bhairahawa: { lat: 27.5045, lng: 83.4500 },
  };

  const computeHaversine = (c1: string, c2: string) => {
    const p1 = CITY_COORDS[c1] || CITY_COORDS.Kathmandu;
    const p2 = CITY_COORDS[c2] || CITY_COORDS.Pokhara;
    const R = 6371; // km
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // 2. Bounding Box Tester
  const [boxRadius, setBoxRadius] = useState<number>(50);
  const computeBox = (radiusKm: number) => {
    const lat = 27.7172; // Kathmandu center
    const lng = 85.3240;
    const deltaLat = radiusKm / 111.045;
    const deltaLng = radiusKm / (111.045 * Math.cos((lat * Math.PI) / 180));
    return {
      minLat: (lat - deltaLat).toFixed(4),
      maxLat: (lat + deltaLat).toFixed(4),
      minLng: (lng - deltaLng).toFixed(4),
      maxLng: (lng + deltaLng).toFixed(4),
    };
  };

  // 3. Dynamic Pricing Tester
  const [testDays, setTestDays] = useState<number>(14);
  const [testBaseDaily, setTestBaseDaily] = useState<number>(15000);
  const [testMonth, setTestMonth] = useState<number>(11); // November (Peak)

  const computeDynamicPricing = () => {
    let discount = 1.0;
    let label = "Standard Daily (0% discount)";
    if (testDays >= 30) {
      discount = 0.8;
      label = "Monthly Enterprise Tier (20% discount)";
    } else if (testDays >= 7) {
      discount = 0.9;
      label = "Weekly Milestone Tier (10% discount)";
    }
    const isMonsoon = testMonth >= 6 && testMonth <= 9;
    const seasonMultiplier = isMonsoon ? 0.92 : 1.05;
    const effectiveDaily = Math.round(testBaseDaily * discount * seasonMultiplier);
    const standardTotal = testBaseDaily * testDays;
    const algorithmTotal = effectiveDaily * testDays;
    const savings = standardTotal - algorithmTotal;

    return {
      effectiveDaily,
      standardTotal,
      algorithmTotal,
      savings,
      tierLabel: label,
      seasonLabel: isMonsoon ? "Monsoon Concession (-8%)" : "Dry Season Peak (+5%)",
    };
  };

  const pricingRes = computeDynamicPricing();
  const boxRes = computeBox(boxRadius);

  return (
    <SmoothModal
      isOpen={isOpen}
      onClose={onClose}
      title="EquipShare Applied Algorithms Portfolio"
      className="max-w-3xl"
    >
      <div className="space-y-6">
        <p className="text-xs text-slate-500">
          EquipShare solves heavy machinery peer-to-peer sharing using four specialized Computer Science & Software Engineering algorithms designed to optimize database retrieval, prevent resource collisions, and model market pricing.
        </p>

        {/* Algorithm Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: "haversine", label: "1. Haversine Formula", icon: <Compass className="w-3.5 h-3.5" /> },
            { id: "bounding", label: "2. 2D Bounding Box", icon: <Layers className="w-3.5 h-3.5" /> },
            { id: "overlap", label: "3. Interval Overlap", icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: "pricing", label: "4. Dynamic Pricing", icon: <TrendingUp className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveAlgo(tab.id as any)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition ${
                activeAlgo === tab.id
                  ? "bg-brand-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ALGO 1: HAVERSINE */}
        {activeAlgo === "haversine" && (
          <div className="space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Spatial Trigonometry • Complexity: O(1) per calculation
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                Active in Production
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1 font-mono text-slate-800">
              <p className="font-bold text-brand-800 font-sans">Great-Circle Spherical Distance Formula:</p>
              <p>a = sin²(Δφ/2) + cos(φ₁) · cos(φ₂) · sin²(Δλ/2)</p>
              <p>c = 2 · atan2(√a, √(1−a))</p>
              <p>d = R · c   (where R = 6,371 km)</p>
            </div>

            {/* Live Interactive Tester */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-brand-600" />
                Live Algorithm Distance Simulator (Nepal Hubs)
              </h5>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Origin City</label>
                  <select
                    className="input w-full text-xs"
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                  >
                    {Object.keys(CITY_COORDS).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Destination Project Site</label>
                  <select
                    className="input w-full text-xs"
                    value={destCity}
                    onChange={(e) => setDestCity(e.target.value)}
                  >
                    {Object.keys(CITY_COORDS).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-lg bg-brand-50 p-3 text-xs">
                <div>
                  <span className="text-slate-600">Great-Circle Distance:</span>
                  <p className="text-lg font-black text-brand-800">
                    {computeHaversine(originCity, destCity)} km
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-600">Est. Nepal Highway Road:</span>
                  <p className="text-sm font-bold text-slate-800">
                    {Math.round(Number(computeHaversine(originCity, destCity)) * 1.38)} km (1.38x tortuosity)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ALGO 2: BOUNDING BOX */}
        {activeAlgo === "bounding" && (
          <div className="space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Spatial Pruning Optimization • Complexity: O(log N + K) with B-Tree
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                Active in Production
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Before computing expensive trigonometric functions across thousands of machinery records, the server computes a 2D bounding box ($Δlat = R / 111.045$, $Δlng = R / (111.045 \cdot \cos(lat))$) to prune away ~95% of irrelevant machinery rows in SQL using indexed bounds.
            </p>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Radius Slider ({boxRadius} km around Kathmandu):</span>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={boxRadius}
                  onChange={(e) => setBoxRadius(Number(e.target.value))}
                  className="w-36 accent-brand-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>Latitude Min: <strong className="text-brand-700">{boxRes.minLat}°</strong></div>
                <div>Latitude Max: <strong className="text-brand-700">{boxRes.maxLat}°</strong></div>
                <div>Longitude Min: <strong className="text-brand-700">{boxRes.minLng}°</strong></div>
                <div>Longitude Max: <strong className="text-brand-700">{boxRes.maxLng}°</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* ALGO 3: INTERVAL OVERLAP */}
        {activeAlgo === "overlap" && (
          <div className="space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Closed-Interval Collision Prevention • Complexity: O(k)
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                Active in Production
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Prevents double-booking by testing interval intersection: an overlap exists if and only if
              <code className="mx-1 px-1.5 py-0.5 bg-slate-200 rounded font-mono text-[11px]">
                S_new ≤ E_existing AND E_new ≥ S_existing
              </code>.
              When inventory quantity Q &gt; 1, the system allows up to Q simultaneous bookings before flagging a 409 Conflict.
            </p>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 font-mono text-xs space-y-1">
              <p className="text-slate-400 font-sans">// Multi-Unit SQL Collision Verification</p>
              <p className="text-purple-700">SELECT COUNT(*) AS overlapping_count FROM bookings</p>
              <p className="text-purple-700">WHERE equipment_id = $id AND status IN (&apos;Approved&apos;, &apos;Active&apos;)</p>
              <p className="text-purple-700">  AND start_date &lt;= $reqEndDate AND end_date &gt;= $reqStartDate;</p>
              <p className="text-slate-700 font-sans mt-2 pt-2 border-t">
                <strong>Rule:</strong> If <code className="text-red-600 font-bold">overlapping_count &gt;= equipment.quantity</code> → Block request with HTTP 409.
              </p>
            </div>
          </div>
        )}

        {/* ALGO 4: DYNAMIC PRICING */}
        {activeAlgo === "pricing" && (
          <div className="space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Yield Management & Multi-Factor Pricing • Complexity: O(1)
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                Active in Production
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Rental Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    className="input w-full text-xs"
                    value={testDays}
                    onChange={(e) => setTestDays(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Base Daily Rate (रु)</label>
                  <input
                    type="number"
                    step="500"
                    className="input w-full text-xs"
                    value={testBaseDaily}
                    onChange={(e) => setTestBaseDaily(Math.max(1000, Number(e.target.value)))}
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Booking Month</label>
                  <select
                    className="input w-full text-xs"
                    value={testMonth}
                    onChange={(e) => setTestMonth(Number(e.target.value))}
                  >
                    <option value="11">Nov (Dry Peak Season)</option>
                    <option value="7">July (Monsoon Off-Peak)</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Duration Incentive Tier:</span>
                  <strong className="text-brand-700">{pricingRes.tierLabel}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Seasonal Factor:</span>
                  <strong className="text-slate-800">{pricingRes.seasonLabel}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Effective Adjusted Daily Rate:</span>
                  <strong className="text-slate-900">रु{pricingRes.effectiveDaily.toLocaleString()}/day</strong>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-800">Algorithm Total Quote:</span>
                  <span className="font-black text-brand-700 text-base">रु{pricingRes.algorithmTotal.toLocaleString()}</span>
                </div>
                {pricingRes.savings > 0 && (
                  <p className="text-[11px] text-emerald-600 font-semibold text-right">
                    Customer saves रु{pricingRes.savings.toLocaleString()} compared to standard rate!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <MagneticButton
            onClick={onClose}
            className="btn-primary text-xs py-2 px-5 rounded-xl"
          >
            Close Portfolio
          </MagneticButton>
        </div>
      </div>
    </SmoothModal>
  );
}
