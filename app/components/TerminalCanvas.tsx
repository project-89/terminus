"use client";

import { useEffect, useRef } from "react";
import { Terminal, TERMINAL_COLORS } from "@/app/lib/terminal/Terminal";
import { FluidScreen } from "@/app/lib/terminal/screens/FluidScreen";
import { analytics } from "@/app/lib/analytics";
import { ScreenRouter } from "@/app/lib/terminal/ScreenRouter";
import { TerminalContext } from "@/app/lib/terminal/TerminalContext";

export function TerminalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize terminal once
  useEffect(() => {
    if (!canvasRef.current || terminalRef.current || !containerRef.current)
      return;

    // Clear game state on fresh load
    const context = TerminalContext.getInstance();
    context.clearState();

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    const terminal = new Terminal(canvasRef.current, {
      width: rect.width,
      height: rect.height,
      fontSize: 16,
      fontFamily: "Berkeley Mono",
      backgroundColor: "#090812",
      foregroundColor: "#5cfffa",
      cursorColor: "#5cfffa",
      blinkRate: 500,
      effects: {
        glow: {
          blur: 16,
          color: "#5cfffa",
          strength: 2.0,
          passes: 2,
        },
        scanlines: {
          spacing: 4,
          opacity: 0.1,
          speed: 0.005,
          offset: 0,
          thickness: 1,
        },
        crt: {
          curvature: 0.15,
          vignetteStrength: 0.25,
          cornerBlur: 0.12,
          scanlineGlow: 0.05,
        },
      },
      cursor: {
        centered: false,
        leftPadding: 20,
        mode: "dynamic",
      },
      pixelation: {
        enabled: true,
        scale: 0.75,
      },
    });

    // Initialize router and properly set it in terminal context
    const router = new ScreenRouter(terminal);
    terminal.context = {
      router,
      currentScreen: null, // Add this to track current screen
    };

    // Store terminal reference
    terminalRef.current = terminal;

    // Show the initial screen based on URL query params
    const params = new URLSearchParams(window.location.search);
    const initialScreen = params.get("screen") || "home";

    // Navigate and update current screen
    router.navigate(initialScreen).catch(console.error);

    // Track page view
    analytics.trackGameAction("page_view", {
      screen: initialScreen,
    });

    // Cleanup
    return () => {
      if (terminalRef.current) {
        terminalRef.current.destroy();
        terminalRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Handle resize
  useEffect(() => {
    function handleResize() {
      if (!canvasRef.current || !containerRef.current || !terminalRef.current)
        return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      terminalRef.current.resize(rect.width, rect.height);
    }

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial resize

    return () => window.removeEventListener("resize", handleResize);
  }, []); // Only run once on mount

  // Handle keyboard input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!terminalRef.current) return;

      if (
        e.key === "Enter" ||
        e.key === "Backspace" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        (e.key === "v" && (e.ctrlKey || e.metaKey)) ||
        e.key.length === 1
      ) {
        e.preventDefault();
        terminalRef.current.handleInput(e.key, e);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // Only run once on mount

  // Handle scrolling
  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      if (!terminalRef.current) return;
      e.preventDefault();
      terminalRef.current.scroll(e.deltaY);
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []); // Only run once on mount

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-black overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
