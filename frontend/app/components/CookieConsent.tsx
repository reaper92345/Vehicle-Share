"use client";

import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  // Show the modal only if consent has not been stored
  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookieConsent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="max-w-md w-full bg-white/30 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">We use cookies</h2>
        <p className="text-sm text-slate-800 mb-4">
          We use cookies to improve your experience. By continuing, you agree to our use of cookies.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={accept}
            className="bg-brand-700 text-white px-4 py-2 rounded-md hover:bg-brand-800 transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

