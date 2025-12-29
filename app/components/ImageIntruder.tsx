"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toolEvents } from "@/app/lib/terminal/tools/registry";

export type IntrusionMode = 
  | "modal"           // Standard dismissable overlay
  | "subliminal"      // Brief flash (100-300ms)
  | "peripheral"      // Appears at edge, fades on "attention"
  | "corruption"      // Bleeds into canvas, distorts
  | "afterimage"      // Persists as ghost after viewing
  | "glitch_scatter"  // Fragments scatter during glitch
  | "creep";          // Slowly fades in from nothing

interface IntrusionEvent {
  url: string;
  mode: IntrusionMode;
  duration?: number;
  intensity?: number;
  position?: "center" | "edge" | "random";
  experimentId?: string;
}

interface ActiveIntrusion extends IntrusionEvent {
  id: string;
  startTime: number;
  opacity: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  phase: "entering" | "active" | "exiting" | "ghost";
}

export function ImageIntruder() {
  const [intrusions, setIntrusions] = useState<ActiveIntrusion[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();

  const addIntrusion = useCallback((event: IntrusionEvent) => {
    const id = `intrusion-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    let x = 50, y = 50;
    if (event.position === "edge") {
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { x = Math.random() * 20; y = Math.random() * 100; }
      else if (edge === 1) { x = 80 + Math.random() * 20; y = Math.random() * 100; }
      else if (edge === 2) { x = Math.random() * 100; y = Math.random() * 20; }
      else { x = Math.random() * 100; y = 80 + Math.random() * 20; }
    } else if (event.position === "random") {
      x = 10 + Math.random() * 80;
      y = 10 + Math.random() * 80;
    }

    const intrusion: ActiveIntrusion = {
      ...event,
      id,
      startTime: Date.now(),
      opacity: event.mode === "creep" ? 0 : 1,
      x,
      y,
      scale: event.mode === "subliminal" ? 1.2 : 1,
      rotation: event.mode === "glitch_scatter" ? (Math.random() - 0.5) * 30 : 0,
      phase: "entering",
    };

    setIntrusions(prev => [...prev, intrusion]);

    if (event.experimentId) {
      console.log(`[INTRUSION EXPERIMENT] ${event.experimentId}: showing ${event.mode} image`);
    }
  }, []);

  useEffect(() => {
    const handleDisplayImage = (params: {
      url: string;
      mode?: IntrusionMode;
      duration?: number;
      intensity?: number;
      position?: "center" | "edge" | "random";
      experimentId?: string;
    }) => {
      if (!params?.url) return;
      addIntrusion({
        url: params.url,
        mode: params.mode || "modal",
        duration: params.duration,
        intensity: params.intensity ?? 1,
        position: params.position || "center",
        experimentId: params.experimentId,
      });
    };

    toolEvents.on("tool:display_image", handleDisplayImage);
    return () => {
      toolEvents.off("tool:display_image", handleDisplayImage);
    };
  }, [addIntrusion]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      
      setIntrusions(prev => {
        const updated = prev.map(intrusion => {
          const elapsed = now - intrusion.startTime;
          const duration = intrusion.duration || getDurationForMode(intrusion.mode);
          
          let newIntrusion = { ...intrusion };

          switch (intrusion.mode) {
            case "subliminal": {
              if (elapsed > duration) {
                return null;
              }
              const flashPhase = elapsed / duration;
              newIntrusion.opacity = flashPhase < 0.1 ? flashPhase * 10 
                : flashPhase > 0.7 ? (1 - flashPhase) / 0.3 
                : 1;
              newIntrusion.scale = 1 + Math.sin(flashPhase * Math.PI) * 0.1;
              break;
            }

            case "peripheral": {
              const distToMouse = Math.hypot(
                (intrusion.x / 100) * window.innerWidth - mousePos.x,
                (intrusion.y / 100) * window.innerHeight - mousePos.y
              );
              const fadeDistance = 200;
              newIntrusion.opacity = Math.min(1, distToMouse / fadeDistance) * (intrusion.intensity ?? 1);
              
              if (elapsed > duration && newIntrusion.opacity < 0.1) {
                return null;
              }
              break;
            }

            case "creep": {
              const creepDuration = duration || 5000;
              if (elapsed < creepDuration * 0.6) {
                newIntrusion.opacity = (elapsed / (creepDuration * 0.6)) * (intrusion.intensity ?? 0.7);
              } else if (elapsed > creepDuration) {
                return null;
              }
              break;
            }

            case "afterimage": {
              if (intrusion.phase === "active" && elapsed > 3000) {
                newIntrusion.phase = "ghost";
                newIntrusion.startTime = now;
              } else if (intrusion.phase === "ghost") {
                const ghostElapsed = now - intrusion.startTime;
                newIntrusion.opacity = Math.max(0, 0.3 - (ghostElapsed / 10000) * 0.3);
                if (newIntrusion.opacity <= 0) return null;
              }
              break;
            }

            case "glitch_scatter": {
              if (elapsed > duration) return null;
              const scatter = Math.sin(elapsed * 0.05) * 20;
              newIntrusion.x = intrusion.x + scatter * Math.cos(elapsed * 0.01);
              newIntrusion.y = intrusion.y + scatter * Math.sin(elapsed * 0.01);
              newIntrusion.rotation = (elapsed * 0.1) % 360;
              newIntrusion.opacity = 0.5 + Math.random() * 0.5;
              break;
            }

            case "corruption": {
              if (elapsed > duration) return null;
              newIntrusion.opacity = 0.6 + Math.random() * 0.4;
              if (Math.random() < 0.1) {
                newIntrusion.x += (Math.random() - 0.5) * 5;
                newIntrusion.y += (Math.random() - 0.5) * 5;
              }
              break;
            }

            case "modal":
            default:
              break;
          }

          return newIntrusion;
        }).filter(Boolean) as ActiveIntrusion[];

        return updated;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [mousePos]);

  const dismissIntrusion = (id: string) => {
    setIntrusions(prev => {
      const intrusion = prev.find(i => i.id === id);
      if (intrusion?.mode === "afterimage" && intrusion.phase === "active") {
        return prev.map(i => 
          i.id === id ? { ...i, phase: "ghost" as const, startTime: Date.now(), opacity: 0.3 } : i
        );
      }
      if (intrusion?.experimentId) {
        console.log(`[INTRUSION EXPERIMENT] ${intrusion.experimentId}: dismissed after ${Date.now() - intrusion.startTime}ms`);
      }
      URL.revokeObjectURL(intrusion?.url || "");
      return prev.filter(i => i.id !== id);
    });
  };

  const getDurationForMode = (mode: IntrusionMode): number => {
    switch (mode) {
      case "subliminal": return 150 + Math.random() * 150;
      case "peripheral": return 8000;
      case "creep": return 6000;
      case "afterimage": return 15000;
      case "glitch_scatter": return 2000;
      case "corruption": return 4000;
      case "modal": return Infinity;
      default: return 5000;
    }
  };

  const getStyleForIntrusion = (intrusion: ActiveIntrusion): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "fixed",
      left: `${intrusion.x}%`,
      top: `${intrusion.y}%`,
      transform: `translate(-50%, -50%) scale(${intrusion.scale}) rotate(${intrusion.rotation}deg)`,
      opacity: intrusion.opacity,
      pointerEvents: intrusion.mode === "modal" ? "auto" : "none",
      zIndex: intrusion.mode === "modal" ? 100 : 50,
      transition: intrusion.mode === "subliminal" ? "none" : "opacity 0.1s",
    };

    switch (intrusion.mode) {
      case "subliminal":
        return {
          ...base,
          filter: "contrast(1.5) brightness(1.2)",
          mixBlendMode: "screen",
        };
      case "peripheral":
        return {
          ...base,
          filter: "blur(2px) saturate(0.5)",
          mixBlendMode: "overlay",
        };
      case "corruption":
        return {
          ...base,
          filter: `hue-rotate(${Math.random() * 360}deg) contrast(1.3)`,
          mixBlendMode: "difference",
          clipPath: `polygon(${Array(6).fill(0).map(() => 
            `${Math.random() * 100}% ${Math.random() * 100}%`
          ).join(", ")})`,
        };
      case "glitch_scatter":
        return {
          ...base,
          filter: "saturate(2) contrast(1.5)",
          mixBlendMode: "exclusion",
        };
      case "afterimage":
        return {
          ...base,
          filter: intrusion.phase === "ghost" ? "blur(4px) saturate(0.3) brightness(0.7)" : "none",
          mixBlendMode: intrusion.phase === "ghost" ? "overlay" : "normal",
        };
      case "creep":
        return {
          ...base,
          filter: `blur(${(1 - intrusion.opacity) * 3}px) saturate(${0.5 + intrusion.opacity * 0.5})`,
        };
      default:
        return base;
    }
  };

  if (intrusions.length === 0) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      {intrusions.map(intrusion => (
        <div
          key={intrusion.id}
          style={getStyleForIntrusion(intrusion)}
          onClick={() => intrusion.mode === "modal" && dismissIntrusion(intrusion.id)}
          className={intrusion.mode === "modal" ? "cursor-pointer" : ""}
        >
          {intrusion.mode === "modal" ? (
            <div className="relative bg-black/90 p-1 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
              <img
                src={intrusion.url}
                alt=""
                className="max-w-[80vw] max-h-[80vh] object-contain"
                style={{ imageRendering: "auto" }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-center">
                <span className="text-cyan-400/70 text-xs font-mono">[CLICK TO DISMISS]</span>
              </div>
            </div>
          ) : (
            <img
              src={intrusion.url}
              alt=""
              className="max-w-[40vw] max-h-[40vh] object-contain"
              style={{ 
                imageRendering: "auto",
                maxWidth: intrusion.mode === "subliminal" ? "60vw" : "40vw",
                maxHeight: intrusion.mode === "subliminal" ? "60vh" : "40vh",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
