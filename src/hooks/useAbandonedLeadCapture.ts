import { useEffect, useRef, useCallback } from "react";
import { captureAbandonedLead } from "@/lib/abandoned-leads";

interface AbandonedLeadData {
  product_id: string;
  product_title: string;
  customer_name: string;
  customer_phone: string;
  wilaya: string;
  commune: string;
}

/**
 * Silent hook that captures abandoned leads when:
 * 1. Phone is filled AND user leaves the page (beforeunload / visibilitychange)
 * 2. Phone is filled AND user is inactive for 30 seconds
 *
 * Does NOT fire if `orderCompleted` is true.
 */
export function useAbandonedLeadCapture(
  getData: () => AbandonedLeadData,
  isPhoneFilled: boolean,
  orderCompleted: boolean
) {
  const capturedRef = useRef(false);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const capture = useCallback(() => {
    if (capturedRef.current || orderCompleted) return;
    const data = getData();
    if (!data.customer_phone || data.customer_phone.trim().length < 5) return;
    capturedRef.current = true;
    captureAbandonedLead(data);
  }, [getData, orderCompleted]);

  // Reset captured flag when phone changes (allows re-capture if user changes phone)
  useEffect(() => {
    capturedRef.current = false;
  }, [isPhoneFilled]);

  // Page leave detection
  useEffect(() => {
    if (!isPhoneFilled || orderCompleted) return;

    const handleBeforeUnload = () => capture();
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") capture();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isPhoneFilled, orderCompleted, capture]);

  // 30s inactivity timer
  useEffect(() => {
    if (!isPhoneFilled || orderCompleted) {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      return;
    }

    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => capture(), 30000);
    };

    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [isPhoneFilled, orderCompleted, capture]);
}
