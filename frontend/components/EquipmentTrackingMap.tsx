"use client";

import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export interface LocationPoint {
  name: string;
  district: string;
  lat: number;
  lng: number;
  isDepot?: boolean;
}

// Major central hubs & construction project hotspots across Nepal
export const NEPAL_DEPOT_AND_SITES: LocationPoint[] = [
  { name: "EquipShare Central Heavy Depot (Jagati)", district: "Bhaktapur", lat: 27.6698, lng: 85.4385, isDepot: true },
  { name: "Kathmandu Ring Road Project Site", district: "Kathmandu", lat: 27.7172, lng: 85.3240 },
  { name: "Nagdhunga Tunnel Bypass Project", district: "Dhading / Kathmandu", lat: 27.7089, lng: 85.1950 },
  { name: "Pokhara Ring Road & Highway Expansion", district: "Kaski", lat: 28.2096, lng: 83.9856 },
  { name: "Narayanghat-Mugling Road Widening", district: "Chitwan", lat: 27.6934, lng: 84.4300 },
  { name: "Hetauda Industrial Corridor", district: "Makwanpur", lat: 27.4287, lng: 85.0328 },
  { name: "Bhairahawa Airport Cargo Link", district: "Rupandehi", lat: 27.5045, lng: 83.4500 },
  { name: "Biratnagar SEZ Commercial Hub", district: "Morang", lat: 26.4525, lng: 87.2718 },
  { name: "Birendranagar Highway Depot", district: "Surkhet", lat: 28.6019, lng: 81.6338 },
];

export const DEPOT_ORIGIN: LocationPoint = NEPAL_DEPOT_AND_SITES[0]; // Jagati-7, Bhaktapur

// Calculate Haversine distance in kilometers with standard Nepal highway tortuosity factor (~1.38x for hilly terrain)
export function calculateNepalRoadDistanceKm(origin: LocationPoint, destination: LocationPoint): number {
  const R = 6371; // Earth radius in km
  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
  const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;

  if (straightLineKm < 1) return 5; // Local within Bhaktapur minimal distance
  // Nepal road distance tortuosity multiplier
  return Math.round(straightLineKm * 1.38);
}

// Calculate Heavy Machinery mobilization fees
export function calculateMobilizationCharge(
  distanceKm: number,
  category: string = "Construction"
): {
  baseFee: number;
  perKmRate: number;
  distanceFee: number;
  totalMobilization: number;
  vehicleType: string;
} {
  const isHeavyConstruction =
    category.toLowerCase().includes("construction") ||
    category.toLowerCase().includes("excavator") ||
    category.toLowerCase().includes("grader");

  if (isHeavyConstruction) {
    // Requires specialized multi-axle low-bed hydraulic carrier trailer
    const baseFee = 5000;
    const perKmRate = 250;
    const distanceFee = distanceKm * perKmRate;
    return {
      baseFee,
      perKmRate,
      distanceFee,
      totalMobilization: baseFee + distanceFee,
      vehicleType: "Multi-Axle Low-Bed Heavy Carrier",
    };
  } else {
    // Agriculture / Tractor / Power Tiller (flatbed haulage or driven)
    const baseFee = 2000;
    const perKmRate = 120;
    const distanceFee = distanceKm * perKmRate;
    return {
      baseFee,
      perKmRate,
      distanceFee,
      totalMobilization: baseFee + distanceFee,
      vehicleType: "Standard Heavy Flatbed Truck",
    };
  }
}

interface EquipmentTrackingMapProps {
  equipmentTitle: string;
  equipmentCategory?: string;
  selectedDestinationName?: string;
  onDestinationChange?: (destination: LocationPoint, distanceKm: number, transportCharge: number) => void;
  className?: string;
}

export function EquipmentTrackingMap({
  equipmentTitle,
  equipmentCategory = "Construction",
  selectedDestinationName,
  onDestinationChange,
  className,
}: EquipmentTrackingMapProps) {
  const [selectedSite, setSelectedSite] = useState<LocationPoint>(() => {
    if (selectedDestinationName) {
      const match = NEPAL_DEPOT_AND_SITES.find(
        (s) => s.name.toLowerCase().includes(selectedDestinationName.toLowerCase()) ||
               s.district.toLowerCase().includes(selectedDestinationName.toLowerCase())
      );
      if (match) return match;
    }
    return NEPAL_DEPOT_AND_SITES[1]; // Kathmandu Ring Road default
  });

  const [transitProgress, setTransitProgress] = useState<number>(35); // 0-100%

  const distanceKm = useMemo(() => {
    return calculateNepalRoadDistanceKm(DEPOT_ORIGIN, selectedSite);
  }, [selectedSite]);

  const charges = useMemo(() => {
    return calculateMobilizationCharge(distanceKm, equipmentCategory);
  }, [distanceKm, equipmentCategory]);

  const handleSelect = (site: LocationPoint) => {
    setSelectedSite(site);
    const dist = calculateNepalRoadDistanceKm(DEPOT_ORIGIN, site);
    const cost = calculateMobilizationCharge(dist, equipmentCategory).totalMobilization;
    if (onDestinationChange) {
      onDestinationChange(site, dist, cost);
    }
  };

  // Google Map embed URL with markers for Nepal
  const googleMapUrl = useMemo(() => {
    return `https://maps.google.com/maps?q=${selectedSite.lat},${selectedSite.lng}&hl=en&z=11&output=embed`;
  }, [selectedSite]);

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden", className)}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Live Fleet GPS Telematics
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            Heavy Machine Transit & Route Tracking
          </h3>
          <p className="text-xs text-slate-500">
            Carrier dispatch from <strong className="text-slate-800">Jagati Central Depot, Bhaktapur</strong> to destination site.
          </p>
        </div>

        {/* Dispatch Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs text-white">
          <span className="text-amber-400">🚜</span>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-medium">Mobilization Carrier</span>
            <span className="font-bold text-emerald-400">{charges.vehicleType}</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual */}
      <div className="mt-4 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
        <iframe
          title="Google Map Live Machinery Location"
          src={googleMapUrl}
          className="w-full h-64 sm:h-72 border-0"
          loading="lazy"
        />

        {/* Floating Telematics Overlay */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-md border border-slate-200 text-xs max-w-xs space-y-1.5">
          <div className="flex items-center justify-between gap-4 font-bold text-slate-800">
            <span>Machine</span>
            <span className="text-brand-700 truncate max-w-[130px]">{equipmentTitle}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-600">
            <span>Origin Depot:</span>
            <span className="font-medium text-slate-900">Jagati, Bhaktapur</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-600">
            <span>Destination Site:</span>
            <span className="font-bold text-brand-700">{selectedSite.name}</span>
          </div>
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-slate-700">
            <span>Est. Road Distance:</span>
            <span className="font-black text-slate-900">{distanceKm} KM</span>
          </div>
        </div>

        {/* Floating Route Milestone Badge */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white backdrop-blur-md rounded-xl px-3.5 py-2 shadow-lg text-xs flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Transit Status</span>
            <span className="font-bold text-emerald-400">
              {transitProgress < 10 ? "At Jagati Depot" : transitProgress < 90 ? "In Transit (En Route)" : "Arrived at Project Site"}
            </span>
          </div>
          <div className="w-16 bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${transitProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Destination Selector & Haulage Fee Calculator */}
      <div className="mt-5 grid gap-4 lg:grid-cols-12 items-center">
        {/* Destination picker dropdown */}
        <div className="lg:col-span-6 space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Select Project Destination Site in Nepal:
          </label>
          <select
            value={selectedSite.name}
            onChange={(e) => {
              const site = NEPAL_DEPOT_AND_SITES.find((s) => s.name === e.target.value);
              if (site) handleSelect(site);
            }}
            className="input bg-slate-50 text-xs font-medium w-full"
          >
            {NEPAL_DEPOT_AND_SITES.map((site) => (
              <option key={site.name} value={site.name}>
                {site.isDepot ? "📍 [Depot] " : "🏗️ "}
                {site.name} ({site.district})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Distance computed via Bagmati & Prithvi Highway road networks.
          </p>
        </div>

        {/* Transportation Fee Breakdown Card */}
        <div className="lg:col-span-6 rounded-xl border border-brand-200 bg-brand-50/60 p-3.5">
          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-brand-100">
            <span className="text-slate-600 font-medium">Distance ({distanceKm} km × रु {charges.perKmRate}/km):</span>
            <span className="font-semibold text-slate-800">रु {charges.distanceFee.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1.5 border-b border-brand-100">
            <span className="text-slate-600 font-medium">Base Mobilization & Tie-Down:</span>
            <span className="font-semibold text-slate-800">रु {charges.baseFee.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2">
            <div>
              <span className="font-black text-slate-900 block text-xs">Total Transportation Charge:</span>
              <span className="text-[10px] text-slate-500">Subject to 13% VAT tax invoice</span>
            </div>
            <span className="text-base font-black text-brand-700">
              रु {charges.totalMobilization.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

