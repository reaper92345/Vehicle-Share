"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RenterPortalRedirect() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("equipshare_user");
    if (!stored) {
      router.replace("/login?redirect=/owner/dashboard");
      return;
    }
    try {
      const user = JSON.parse(stored);
      const role = (user.role || user.user_type || "").toLowerCase();
      if (["owner", "both", "admin"].includes(role)) {
        router.replace("/owner/dashboard");
      } else {
        router.replace("/hire/dashboard");
      }
    } catch (_) {
      router.replace("/login");
    }
  }, [router]);

  return <p className="p-8 text-slate-500">Opening your portal…</p>;
}
