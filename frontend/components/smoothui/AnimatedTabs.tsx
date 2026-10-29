"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

interface AnimatedTabsProps<T extends string> {
  tabs: { id: T; label: string; badge?: number | string; icon?: React.ReactNode }[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
}

export function AnimatedTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: AnimatedTabsProps<T>) {
  return (
    <div className={cn("flex space-x-1 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 shadow-inner", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-colors duration-200 flex items-center gap-2 z-10",
              isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && Number(tab.badge) > 0 && (
              <span className="rounded-full bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 shadow-sm animate-pulse">
                {tab.badge}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/80 -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

