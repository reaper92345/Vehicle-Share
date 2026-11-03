"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

interface StatWidgetProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: string;
  className?: string;
  accentColor?: "emerald" | "amber" | "blue" | "brand";
}

export function StatWidget({
  label,
  value,
  icon,
  trend,
  className,
  accentColor = "brand",
}: StatWidgetProps) {
  // Muted / pastel accent fills — never harsh saturated colors
  const colorMap = {
    brand:   "text-brand-700 bg-brand-50/70 border border-brand-100/80",
    emerald: "text-[#065F46] bg-[#ECFDF5] border border-emerald-100/80",
    amber:   "text-[#92400E] bg-[#FFFBEB] border border-amber-100/80",
    blue:    "text-[#1E40AF] bg-[#EFF6FF] border border-blue-100/80",
  };

  return (
    <motion.div
      // Lift on hover — no background jump
      whileHover={{ y: -3, transition: { duration: 0.18, ease: "easeOut" } }}
      className={cn(
        // Card foundation — off-white bg, semi-transparent border, layered shadow
        "relative overflow-hidden rounded-2xl bg-white p-5 transition-shadow duration-200",
        "hover:shadow-elevated",
        className
      )}
      style={{
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex items-center justify-between">
        {/* Small-caps label — positive tracking */}
        <p
          className="text-[11px] font-semibold uppercase"
          style={{ letterSpacing: "0.05em", color: "#737373" }}
        >
          {label}
        </p>
        {icon && (
          <div
            className={cn(
              // Icon container — inner radius (one step tighter than card)
              "flex h-8 w-8 items-center justify-center rounded-lg text-sm",
              colorMap[accentColor]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value — display font, tight tracking */}
      <p
        className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight"
        style={{ color: "#171717", letterSpacing: "-0.02em", lineHeight: "1.1" }}
      >
        {value}
      </p>

      {trend && (
        <p className="mt-1 text-xs font-medium" style={{ color: "#A3A3A3" }}>
          {trend}
        </p>
      )}
    </motion.div>
  );
}
