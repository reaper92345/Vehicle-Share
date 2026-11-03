"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

export type NotificationType = "success" | "error" | "warning" | "info" | "tax_invoice";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  durationMs?: number;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

interface NotificationContextType {
  notifications: NotificationItem[];
  notify: (item: Omit<NotificationItem, "id">) => string;
  dismiss: (id: string) => void;
  success: (title: string, message?: string, action?: NotificationItem["action"]) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  taxInvoice: (invNumber: string, recipientEmail: string, href?: string) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (item: Omit<NotificationItem, "id">) => {
      const id = "notif_" + Math.random().toString(36).substring(2, 9);
      const fullItem: NotificationItem = {
        ...item,
        id,
        durationMs: item.durationMs ?? (item.type === "tax_invoice" ? 8000 : 5000),
      };

      setNotifications((prev) => [fullItem, ...prev.slice(0, 4)]); // max 5 active

      if (fullItem.durationMs && fullItem.durationMs > 0) {
        setTimeout(() => {
          dismiss(id);
        }, fullItem.durationMs);
      }

      return id;
    },
    [dismiss]
  );

  const success = useCallback(
    (title: string, message?: string, action?: NotificationItem["action"]) => {
      return notify({ type: "success", title, message, action });
    },
    [notify]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      return notify({ type: "error", title, message });
    },
    [notify]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      return notify({ type: "warning", title, message });
    },
    [notify]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      return notify({ type: "info", title, message });
    },
    [notify]
  );

  const taxInvoice = useCallback(
    (invNumber: string, recipientEmail: string, href?: string) => {
      return notify({
        type: "tax_invoice",
        title: `Official Tax Invoice Generated: ${invNumber}`,
        message: `Dispatched to ${recipientEmail} with 13% IRD VAT breakdown.`,
        action: href
          ? {
              label: "View Invoice",
              href,
            }
          : undefined,
      });
    },
    [notify]
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, notify, dismiss, success, error, warning, info, taxInvoice }}
    >
      {children}
      <NotificationContainer notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
}

function NotificationContainer({
  notifications,
  onDismiss,
}: {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((item) => (
          <NotificationToast key={item.id} item={item} onDismiss={() => onDismiss(item.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Muted / pastel config — never harsh saturated colors ───────────────────
function getToastConfig(type: NotificationType) {
  switch (type) {
    case "success":
      return {
        icon: "✓",
        bg: "#FFFFFF",
        border: "rgba(6,95,70,0.15)",
        iconBg: "#ECFDF5",
        iconColor: "#065F46",
        barBg: "#16A34A",
      };
    case "error":
      return {
        icon: "✕",
        bg: "#FFFFFF",
        border: "rgba(153,27,27,0.15)",
        iconBg: "#FEF2F2",
        iconColor: "#991B1B",
        barBg: "#DC2626",
      };
    case "warning":
      return {
        icon: "!",
        bg: "#FFFFFF",
        border: "rgba(146,64,14,0.15)",
        iconBg: "#FFFBEB",
        iconColor: "#92400E",
        barBg: "#D97706",
      };
    case "tax_invoice":
      return {
        icon: "🧾",
        bg: "#0F172A",
        border: "rgba(255,255,255,0.08)",
        iconBg: "rgba(255,255,255,0.07)",
        iconColor: "#86EFAC",
        barBg: "#4ADE80",
      };
    case "info":
    default:
      return {
        icon: "ℹ",
        bg: "#FFFFFF",
        border: "rgba(46,111,61,0.15)",
        iconBg: "#f0f7f1",
        iconColor: "#2e6f3d",
        barBg: "#2e6f3d",
      };
  }
}

function NotificationToast({
  item,
  onDismiss,
}: {
  item: NotificationItem;
  onDismiss: () => void;
}) {
  const config = getToastConfig(item.type);
  const isDark = item.type === "tax_invoice";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, x: 24 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      drag="x"
      dragConstraints={{ left: 0, right: 120 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 80) onDismiss();
      }}
      className="pointer-events-auto relative overflow-hidden rounded-2xl p-4 select-none"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06), 0 16px 32px -4px rgba(0,0,0,0.10)",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon badge */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black"
          style={{ background: config.iconBg, color: config.iconColor }}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <p
            className="text-xs font-bold leading-snug"
            style={{ color: isDark ? "#F1F5F9" : "#171717" }}
          >
            {item.title}
          </p>
          {item.message && (
            <p
              className="mt-0.5 text-[11px] leading-relaxed"
              style={{ color: isDark ? "#94A3B8" : "#737373" }}
            >
              {item.message}
            </p>
          )}

          {item.action && (
            <div className="mt-2 flex items-center gap-2">
              {item.action.href ? (
                <a
                  href={item.action.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold uppercase tracking-label underline transition-opacity hover:opacity-70"
                  style={{ color: isDark ? "#86EFAC" : "#2e6f3d", letterSpacing: "0.05em" }}
                >
                  {item.action.label} →
                </a>
              ) : (
                <button
                  onClick={item.action.onClick}
                  className="text-[10px] font-bold uppercase underline transition-opacity hover:opacity-70"
                  style={{ color: isDark ? "#86EFAC" : "#2e6f3d", letterSpacing: "0.05em" }}
                >
                  {item.action.label}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] transition-all duration-150 hover:bg-black/8 active:scale-[0.9]"
          style={{ color: isDark ? "#64748B" : "#A3A3A3" }}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>

      {/* Auto-dismiss progress line */}
      {item.durationMs && item.durationMs > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: item.durationMs / 1000, ease: "linear" }}
          className="absolute bottom-0 left-0 h-[2px] rounded-full"
          style={{ background: config.barBg }}
        />
      )}
    </motion.div>
  );
}
