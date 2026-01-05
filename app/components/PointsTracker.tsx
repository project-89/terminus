"use client";

import { useEffect, useState, useRef } from "react";
import { toolEvents } from "@/app/lib/terminal/tools/registry";

interface PointsPopup {
  id: number;
  amount: number;
  reason: string;
}

export function PointsTracker() {
  const [points, setPoints] = useState<number | null>(null);
  const [popups, setPopups] = useState<PointsPopup[]>([]);
  const [pulse, setPulse] = useState(false);
  const popupIdRef = useRef(0);
  const handleRef = useRef<string | null>(null);

  useEffect(() => {
    const getHandle = () => {
      try {
        const directHandle = localStorage.getItem("p89_handle");
        if (directHandle) {
          return directHandle;
        }
        const saved = localStorage.getItem("terminalState");
        if (saved) {
          const state = JSON.parse(saved);
          const h = state.handle;
          if (h) {
            return h;
          }
        }
      } catch (e) {}
      return null;
    };

    const handle = getHandle();
    if (handle) {
      handleRef.current = handle;
      fetchPoints(handle);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "p89_handle" && e.newValue) {
        handleRef.current = e.newValue;
        fetchPoints(e.newValue);
      } else if (e.key === "terminalState" && e.newValue) {
        try {
          const state = JSON.parse(e.newValue);
          const h = state.handle;
          if (h && h !== handleRef.current) {
            handleRef.current = h;
            fetchPoints(h);
          }
        } catch (e) {}
      }
    };

    window.addEventListener("storage", handleStorage);

    const interval = setInterval(() => {
      const h = getHandle();
      if (h && h !== handleRef.current) {
        handleRef.current = h;
        fetchPoints(h);
      }
    }, 2000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const fetchPoints = async (handle: string) => {
    try {
      const res = await fetch(`/api/points?handle=${encodeURIComponent(handle)}`);
      const data = await res.json();
      // Show 0 points if user exists, or if they have any points data
      // Hide only if truly no session exists yet
      if (res.ok || data.points !== undefined) {
        setPoints(data.points ?? 0);
      } else if (data.error === "User not found") {
        // User doesn't exist yet - they'll be created on first interaction
        // Don't show tracker until they have a session
        setPoints(null);
      }
    } catch (e) {
      console.warn("Failed to fetch points:", e);
    }
  };

  useEffect(() => {
    const handleAward = (params: {
      amount: number;
      reason: string;
      silent?: boolean;
    }) => {
      if (params.silent) return;

      const id = ++popupIdRef.current;
      setPopups((prev) => [...prev, { id, amount: params.amount, reason: params.reason }]);
      setPoints((prev) => (prev ?? 0) + params.amount);
      setPulse(true);

      setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== id));
      }, 3000);

      setTimeout(() => setPulse(false), 600);
    };

    toolEvents.on("tool:award_points", handleAward);
    return () => {
      toolEvents.off("tool:award_points", handleAward);
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
