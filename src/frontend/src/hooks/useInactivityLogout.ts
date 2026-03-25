import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "./useInternetIdentity";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE = 60 * 1000; // 60 seconds warning

export function useInactivityLogout() {
  const { clear, identity } = useInternetIdentity();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningShownRef = useRef(false);

  useEffect(() => {
    if (!identity) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      warningShownRef.current = false;

      warningTimerRef.current = setTimeout(() => {
        if (!warningShownRef.current) {
          warningShownRef.current = true;
          toast.warning(
            "\u23f1\ufe0f You will be logged out in 60 seconds due to inactivity.",
            { id: "inactivity-warning", duration: 60000 },
          );
        }
      }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

      timerRef.current = setTimeout(() => {
        toast.dismiss("inactivity-warning");
        toast.info("You have been logged out due to inactivity.");
        clear();
        window.location.href = "/";
      }, INACTIVITY_TIMEOUT);
    };

    const events: string[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];
    for (const e of events) {
      window.addEventListener(e, resetTimer, { passive: true });
    }
    resetTimer();

    return () => {
      for (const e of events) {
        window.removeEventListener(e, resetTimer);
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [identity, clear]);
}
