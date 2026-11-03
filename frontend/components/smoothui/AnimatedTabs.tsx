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
    <div
      className={cn("flex space-x-0.5 p-1 rounded-2xl shadow-inner", className)}
      style={{
        background: "rgba(0,0,0,0.03)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              // Layout
              "relative px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 z-10",
              // Transition — no instant color jumps
              "transition-colors duration-150",
              // States
              isActive
                ? "text-ink"
                : "text-ink-subtle hover:text-ink-muted"
            )}
            style={{
              letterSpacing: "0.01em",
              color: isActive ? "#171717" : "#737373",
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>

            {/* Badge — muted amber */}
            {tab.badge !== undefined && Number(tab.badge) > 0 && (
              <span
                className="rounded-full text-[10px] font-bold px-1.5 py-0.5"
                style={{
                  background: "#FFFBEB",
                  color: "#92400E",
                  border: "1px solid rgba(146,64,14,0.15)",
                }}
              >
                {tab.badge}
              </span>
            )}

            {/* Active pill — slides smoothly under */}
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 rounded-xl -z-10"
                style={{
                  background: "#FFFFFF",
                  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05), 0 2px 6px -1px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
