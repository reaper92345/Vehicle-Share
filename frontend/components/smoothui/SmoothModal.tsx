"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

interface SmoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function SmoothModal({
  isOpen,
  onClose,
  children,
  title,
  className,
}: SmoothModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop — softer than default */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-[6px]"
            style={{ background: "rgba(15,23,42,0.45)" }}
          />

          {/* Modal container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={cn(
              // Off-white card, nested radius (inner = outer - padding diff)
              "relative z-10 w-full max-w-lg overflow-hidden rounded-2xl p-6",
              className
            )}
            style={{
              background: "#FAFBFC",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 8px 16px -4px rgba(0,0,0,0.06), 0 32px 64px -8px rgba(0,0,0,0.12)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between pb-3 mb-4"
              style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
            >
              {title && (
                <h3
                  className="text-base font-bold"
                  style={{ color: "#171717", letterSpacing: "-0.01em" }}
                >
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className={cn(
                  "ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-all duration-150",
                  "hover:bg-black/5 active:scale-[0.94]"
                )}
                style={{ color: "#A3A3A3" }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
