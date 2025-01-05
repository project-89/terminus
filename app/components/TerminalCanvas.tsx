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
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  const isMobile = () => {
    return typeof window !== "undefined" && window.innerWidth < 480;
  };

  // Initialize terminal once
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Get existing terminal instance or create new one
    let terminal = Terminal.getInstance();
    if (!terminal) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      terminal = new Terminal(canvasRef.current, {
        width: rect.width,
        height: rect.height,
        fontSize: 16,
        fontFamily: "Berkeley Mono",
        backgroundColor: "#090812",
        foregroundColor: "#2fb7c3",
        cursorColor: "#2fb7c3",
        blinkRate: 500,
        effects: {
          glow: {
            blur: 16,
            color: "#2fb7c3",
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

      // Clear game state on fresh load
      const context = TerminalContext.getInstance();
      context.clearState();

      // Initialize router and properly set it in terminal context
      const router = new ScreenRouter(terminal);
      terminal.context = {
        router,
        currentScreen: null,
      };

      // Show the initial screen based on URL query params
      const params = new URLSearchParams(window.location.search);
      const initialScreen = params.get("screen") || "home";

      // Navigate and update current screen
      router.navigate(initialScreen).catch(console.error);

      // Track page view
      analytics.trackGameAction("page_view", {
        screen: initialScreen,
      });
    }

    // Store terminal reference
    terminalRef.current = terminal;

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
      // Skip if the event is from our hidden input
      if (e.target instanceof HTMLInputElement) {
        return;
      }

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
        // Focus hidden input and simulate key press
        if (hiddenInputRef.current) {
          hiddenInputRef.current.focus();
          terminalRef.current.handleInput(e.key, e);
          // Update hidden input value
          requestAnimationFrame(() => {
            if (hiddenInputRef.current && terminalRef.current?.inputHandler) {
              hiddenInputRef.current.value =
                terminalRef.current.inputHandler.getInputBuffer();
            }
          });
        }
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

    // Attach event listener to the canvas element
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
      }
    };
  }, []); // Only run once on mount

  // Add click to focus hidden input
  function handleCanvasClick() {
    if (hiddenInputRef.current && terminalRef.current?.getCommandAccess()) {
      hiddenInputRef.current.focus();
      if (isMobile()) {
        hiddenInputRef.current.click();
      }
    }
  }

  // Add input keydown handler
  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    e.preventDefault();
    if (!terminalRef.current) return;

    // Handle special keys
    if (e.key === "Enter") {
      const input = e.currentTarget;
      const command = input.value;
      input.value = "";
      terminalRef.current.processCommand(command);
      terminalRef.current.scrollToLatest();
      return;
    }

    // Handle arrow keys
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      terminalRef.current.handleInput(e.key);
      requestAnimationFrame(() => {
        if (hiddenInputRef.current && terminalRef.current?.inputHandler) {
          hiddenInputRef.current.value =
            terminalRef.current.inputHandler.getInputBuffer();
          // Set cursor position for left/right arrows
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            const pos = terminalRef.current.inputHandler.getCursorPosition();
            hiddenInputRef.current.setSelectionRange(pos, pos);
          }
        }
      });
      return;
    }

    // Handle backspace
    if (e.key === "Backspace") {
      terminalRef.current.handleInput(e.key);
      requestAnimationFrame(() => {
        if (hiddenInputRef.current && terminalRef.current?.inputHandler) {
          hiddenInputRef.current.value =
            terminalRef.current.inputHandler.getInputBuffer();
        }
      });
      return;
    }

    // Handle all other keyboard input through terminal
    if (e.key.length === 1) {
      terminalRef.current.handleInput(e.key);
    }

    // Sync hidden input with terminal's buffer
    requestAnimationFrame(() => {
      if (hiddenInputRef.current && terminalRef.current?.inputHandler) {
        hiddenInputRef.current.value =
          terminalRef.current.inputHandler.getInputBuffer();
        terminalRef.current.scrollToLatest();
      }
    });
  }

  // Add focus management
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        hiddenInputRef.current?.blur();
      } else if (terminalRef.current?.getCommandAccess()) {
        hiddenInputRef.current?.focus();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#090812] overflow-hidden">
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="relative w-full h-full flex items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ background: "#090812" }}
        />
        <input
          ref={hiddenInputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
          enterKeyHint="send"
          onKeyDown={handleInputKeyDown}
          style={{
            position: "fixed",
            opacity: isMobile() ? 0.01 : 0,
            width: isMobile() ? "100%" : "1px",
            height: isMobile() ? "50px" : "1px",
            pointerEvents: isMobile() ? "auto" : "none",
            bottom: 0,
            left: 0,
            fontSize: "16px",
            zIndex: 1000,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "transparent",
            caretColor: "transparent",
          }}
        />
      </div>
    </div>
  );
}
