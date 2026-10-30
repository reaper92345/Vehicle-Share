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

function NotificationToast({
  item,
  onDismiss,
}: {
  item: NotificationItem;
  onDismiss: () => void;
}) {
  const getBadgeConfig = () => {
    switch (item.type) {
      case "success":
        return {
          icon: "✓",
          border: "border-emerald-200",
          bg: "bg-white",
          iconBg: "bg-emerald-100 text-emerald-800",
          barBg: "bg-emerald-500",
        };
      case "error":
        return {
          icon: "✕",
          border: "border-rose-200",
          bg: "bg-white",
          iconBg: "bg-rose-100 text-rose-800",
          barBg: "bg-rose-500",
        };
      case "warning":
        return {
          icon: "!",
          border: "border-amber-200",
          bg: "bg-white",
          iconBg: "bg-amber-100 text-amber-800",
          barBg: "bg-amber-500",
        };
      case "tax_invoice":
        return {
          icon: "🧾",
          border: "border-slate-800",
          bg: "bg-slate-900 text-white",
          iconBg: "bg-slate-800 text-emerald-400 border border-slate-700",
          barBg: "bg-emerald-400",
        };
      case "info":
      default:
        return {
          icon: "ℹ",
          border: "border-brand-200",
          bg: "bg-white",
          iconBg: "bg-brand-100 text-brand-800",
          barBg: "bg-brand-600",
        };
    }
  };

  const config = getBadgeConfig();
  const isDark = item.type === "tax_invoice";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: 20 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      drag="x"
      dragConstraints={{ left: 0, right: 120 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 80) onDismiss();
      }}
      className={cn(
        "pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-shadow select-none",
        config.border,
        config.bg
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black",
            config.iconBg
          )}
        >
          {config.icon}
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <p
            className={cn(
              "text-xs font-bold leading-snug",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            {item.title}
          </p>
          {item.message && (
            <p
              className={cn(
                "mt-0.5 text-[11px] leading-relaxed",
                isDark ? "text-slate-300" : "text-slate-600"
              )}
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
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider underline hover:opacity-80",
                    isDark ? "text-emerald-300" : "text-brand-700"
                  )}
                >
                  {item.action.label} →
                </a>
              ) : (
                <button
                  onClick={item.action.onClick}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider underline hover:opacity-80",
                    isDark ? "text-emerald-300" : "text-brand-700"
                  )}
                >
                  {item.action.label}
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onDismiss}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] transition hover:bg-slate-200/50",
            isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
          )}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>

      {/* Auto dismiss progress line */}
      {item.durationMs && item.durationMs > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: item.durationMs / 1000, ease: "linear" }}
          className={cn("absolute bottom-0 left-0 h-[2px]", config.barBg)}
        />
      )}
    </motion.div>
  );
}

