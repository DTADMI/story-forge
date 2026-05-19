"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOffline(!navigator.onLine);
    if (!navigator.onLine) setShow(true);

    const handleOnline = () => {
      setOffline(false);
      setTimeout(() => setShow(false), 2000);
    };

    const handleOffline = () => {
      setOffline(true);
      setShow(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
        offline ? "bg-amber-500 text-white" : "bg-green-500 text-white"
      }`}
    >
      {offline ? (
        <>
          <WifiOff className="h-4 w-4" />
          You&apos;re offline — changes will sync when you reconnect
        </>
      ) : (
        "Back online — your connection has been restored"
      )}
    </div>
  );
}
