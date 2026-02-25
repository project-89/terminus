"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { toolEvents } from "@/app/lib/terminal/tools/registry";

interface PointsPopup {
  id: number;
  amount: number;
  reason: string;
}

interface PointsIdentity {
  userId?: string;
  handle?: string;
}

export function PointsTracker() {
  const [points, setPoints] = useState<number | null>(null);
  const [popups, setPopups] = useState<PointsPopup[]>([]);
  const [pulse, setPulse] = useState(false);
  const popupIdRef = useRef(0);
  const identityRef = useRef<PointsIdentity | null>(null);
  const requestSeqRef = useRef(0);

  const readIdentity = useCallback((): PointsIdentity | null => {
    try {
      const directUserId = localStorage.getItem("p89_userId") || undefined;
      const directHandle = localStorage.getItem("p89_handle") || undefined;
      const saved = localStorage.getItem("terminalState");
      const parsedState = saved ? JSON.parse(saved) : null;
      const stateUserId = parsedState?.userId || undefined;
      const stateHandle = parsedState?.handle || undefined;

      const identity: PointsIdentity = {
        userId: directUserId || stateUserId,
        handle: directHandle || stateHandle,
      };

      if (!identity.userId && !identity.handle) {
        return null;
      }

      return identity;
    } catch {
      return null;
    }
  }, []);

  const identityEquals = (a: PointsIdentity | null, b: PointsIdentity | null) =>
    (a?.userId || "") === (b?.userId || "") &&
    (a?.handle || "") === (b?.handle || "");

  const fetchPoints = useCallback(async (identity: PointsIdentity) => {
    const attempts: string[] = [];
    if (identity.userId) {
      attempts.push(`userId=${encodeURIComponent(identity.userId)}`);
    }
    if (identity.handle) {
      attempts.push(`handle=${encodeURIComponent(identity.handle)}`);
    }

    if (attempts.length === 0) {
      setPoints(null);
      return;
    }

    const requestId = ++requestSeqRef.current;
    let lastError: string | undefined;

    for (const query of attempts) {
      try {
        const res = await fetch(`/api/points?${query}`, { cache: "no-store" });
        const data = await res.json();

        if (requestId !== requestSeqRef.current) {
          return;
        }

        if (res.ok || data.points !== undefined) {
          setPoints(data.points ?? 0);
          return;
        }

        lastError = data?.error;
      } catch (e) {
        console.warn("Failed to fetch points:", e);
      }
    }

    // Hide tracker only when identity lookup truly fails.
    if (lastError === "User not found") {
      setPoints(null);
    }
  }, []);

  useEffect(() => {
    const syncIdentity = (forceRefresh = false) => {
      const identity = readIdentity();
      if (!identity) {
        identityRef.current = null;
        setPoints(null);
        return;
      }

      const changed = !identityEquals(identityRef.current, identity);
      identityRef.current = identity;
      if (changed || forceRefresh) {
        void fetchPoints(identity);
      }
    };

    syncIdentity(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "p89_handle" || e.key === "p89_userId" || e.key === "terminalState") {
        syncIdentity(true);
      }
    };

    const handleFocus = () => syncIdentity(true);

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    // Keep the corner value aligned with server truth, including silent awards.
    const interval = setInterval(() => {
      syncIdentity(true);
    }, 6000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [fetchPoints, readIdentity]);

  useEffect(() => {
    const handleAward = (params: {
      amount: number;
      reason: string;
      silent?: boolean;
    }) => {
      if (!params.silent) {
        const id = ++popupIdRef.current;
        setPopups((prev) => [...prev, { id, amount: params.amount, reason: params.reason }]);
        setPoints((prev) => (prev ?? 0) + params.amount);
        setPulse(true);

        setTimeout(() => {
          setPopups((prev) => prev.filter((p) => p.id !== id));
        }, 3000);

        setTimeout(() => setPulse(false), 600);
      }

      // Always reconcile against ledger truth after awards (including silent ones).
      const identity = identityRef.current || readIdentity();
      if (identity) {
        identityRef.current = identity;
        setTimeout(() => void fetchPoints(identity), 150);
      }
    };

    toolEvents.on("tool:award_points", handleAward);
    return () => {
      toolEvents.off("tool:award_points", handleAward);
    };
  }, [fetchPoints, readIdentity]);

  useEffect(() => {
    const handlePointsSync = (params: { points?: number | string }) => {
      const parsed = Number(params?.points);
      if (!Number.isNaN(parsed)) {
        setPoints(parsed);
      }
    };

    toolEvents.on("tool:points_sync", handlePointsSync);
    return () => {
      toolEvents.off("tool:points_sync", handlePointsSync);
    };
  }, []);

  if (points === null) return null;

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none font-mono">
      <div
        className={`
          px-3 py-1.5 rounded-sm
          bg-[#090812]/90 border border-[#2fb7c3]/30
          text-[#2fb7c3] text-sm
          transition-all duration-300
          ${pulse ? "scale-110 border-[#39ff14] shadow-[0_0_20px_rgba(57,255,20,0.5)]" : ""}
        `}
        style={{
          textShadow: pulse ? "0 0 10px #39ff14" : "0 0 5px #2fb7c3",
        }}
      >
        <span className="opacity-60">LOGOS</span>{" "}
        <span className="font-bold">{points.toLocaleString()}</span>
      </div>

      <div className="absolute top-full right-0 mt-2 space-y-2">
        {popups.map((popup) => (
          <div
            key={popup.id}
            className="animate-point-popup px-3 py-2 rounded-sm bg-[#090812]/95 border border-[#39ff14]/50"
            style={{
              textShadow: "0 0 8px #39ff14",
            }}
          >
            <div className="text-[#39ff14] font-bold text-sm">
              +{popup.amount}
            </div>
            <div className="text-[#2fb7c3]/80 text-xs max-w-[200px] truncate">
              {popup.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
