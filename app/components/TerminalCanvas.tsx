"use client";

import { useEffect, useRef } from "react";
import { Terminal, TERMINAL_COLORS } from "@/app/lib/terminal/Terminal";
import { useChat } from "ai/react";
import { triggerEffect } from "@/app/lib/terminal/eventSystem";
import { helpMiddleware } from "@/app/lib/terminal/middleware/help";
import { clearMiddleware } from "@/app/lib/terminal/middleware/clear";
import { WelcomeScreen } from "@/app/lib/terminal/screens/WelcomeScreen";
import { ScanningScreen } from "@/app/lib/terminal/screens/ScanningScreen";
import { MainScreen } from "@/app/lib/terminal/screens/MainScreen";
import { ScreenRouter } from "@/app/lib/terminal/ScreenRouter";
import { ConsentScreen } from "@/app/lib/terminal/screens/ConsentScreen";
import { navigationMiddleware } from "@/app/lib/terminal/middleware/navigation";
import { AdventureScreen } from "@/app/lib/terminal/screens/AdventureScreen";

export function TerminalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const terminalRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create terminal with minimal options
    const terminal = new Terminal(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      fontSize: 16,
      fontFamily: "Berkeley Mono",
      backgroundColor: "#090812",
      foregroundColor: "#5cfffa",
      cursorColor: "#5cfffa",
      blinkRate: 500,
      effects: {
        glow: {
          blur: 32,
          color: "#5cfffa",
          strength: 4.0,
          passes: 3,
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
      },
      pixelation: {
        enabled: true,
        scale: 0.75,
      },
    });

    terminalRef.current = terminal;

    // Register screens
    const router = new ScreenRouter(terminal);
    router
      .register("adventure", AdventureScreen)
      .register("welcome", WelcomeScreen)
      .register("scanning", ScanningScreen)
      .register("consent", ConsentScreen)
      .register("main", MainScreen);

    // Add router to terminal for middleware access
    terminal.context = { router };

    // Register middlewares
    terminal.use(helpMiddleware).use(clearMiddleware).use(navigationMiddleware);

    // Test direct terminal printing
    terminal.print("Direct print test", {
      color: TERMINAL_COLORS.primary,
      speed: "instant",
    });

    // Navigate to adventure screen
    router.navigate("adventure").catch(console.error);

    // Add keyboard handler
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for terminal keys
      if (e.key === "Enter" || e.key === "Backspace" || e.key.length === 1) {
        e.preventDefault();
        terminalRef.current?.handleInput(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Add scroll handler with smoother scrolling
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (terminalRef.current) {
        terminalRef.current.scroll(e.deltaY);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
      terminal.destroy();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
