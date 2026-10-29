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
  const colorMap = {
    brand: "text-brand-700 bg-brand-50 border-brand-100",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    blue: "text-blue-700 bg-blue-50 border-blue-100",
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        {icon && (
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl border text-sm", colorMap[accentColor])}>
            {icon}
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      {trend && <p className="mt-1 text-xs text-slate-400 font-medium">{trend}</p>}
    </motion.div>
  );
}

