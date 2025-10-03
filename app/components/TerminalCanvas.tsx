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
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);
  const baseBottomPaddingRef = useRef<number>(0);

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

    // Establish a base bottom padding so the last line is always visible on mobile
    const fontSize = terminal.options?.fontSize ?? 16;
    const lineHeight = fontSize * 1.5;
    baseBottomPaddingRef.current = isMobile() ? Math.round(lineHeight * 2) : 0;
    terminal.setBottomPadding(baseBottomPaddingRef.current);

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

  // Add click to focus hidden input
  function handleCanvasClick() {
    if (hiddenInputRef.current && terminalRef.current?.getCommandAccess()) {
      hiddenInputRef.current.focus();
      // Only trigger click on mobile
      if (isMobile()) {
        hiddenInputRef.current.click();
        setTimeout(() => {
          terminalRef.current?.scrollToLatest();
        }, 100);
      }
    }
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
        terminalRef.current.handleInput(e.key);

        // Sync hidden input if it exists
        if (hiddenInputRef.current) {
          requestAnimationFrame(() => {
            if (terminalRef.current?.inputHandler) {
              hiddenInputRef.current!.value =
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

  // Touch gestures: distinguish tap (focus input) vs drag (scroll)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStartYRef.current = t.clientY;
      touchStartXRef.current = t.clientX;
      touchStartTimeRef.current = performance.now();
      isScrollingRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!terminalRef.current) return;
      if (touchStartYRef.current === null) return;
      const t = e.touches[0];
      const dy = touchStartYRef.current - t.clientY;
      const dx = (touchStartXRef.current ?? t.clientX) - t.clientX;
      const moved = Math.hypot(dx, dy);
      const moveThreshold = 6;
      if (moved > moveThreshold) {
        isScrollingRef.current = true;
      }
      if (isScrollingRef.current) {
        e.preventDefault();
        terminalRef.current.scroll(dy);
        touchStartYRef.current = t.clientY; // incremental scrolling
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const now = performance.now();
      const duration = now - touchStartTimeRef.current;
      const wasScroll = isScrollingRef.current;
      touchStartYRef.current = null;
      touchStartXRef.current = null;
      isScrollingRef.current = false;

      if (!wasScroll && duration < 220) {
        // Treat as tap → focus input
        if (hiddenInputRef.current && terminalRef.current?.getCommandAccess()) {
          hiddenInputRef.current.focus();
        }
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, {
      passive: true,
    });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart as any);
      container.removeEventListener("touchmove", handleTouchMove as any);
      container.removeEventListener("touchend", handleTouchEnd as any);
      container.removeEventListener("touchcancel", handleTouchEnd as any);
    };
  }, []);

  // Add click to focus hidden input
  // function handleCanvasClick() {
  //   if (hiddenInputRef.current && terminalRef.current?.getCommandAccess()) {
  //     hiddenInputRef.current.focus();
  //     if (isMobile()) {
  //       hiddenInputRef.current.click();
  //     }
  //   }
  // }

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
      // Clear the terminal's input buffer so the prompt line resets
      if (terminalRef.current.inputHandler) {
        terminalRef.current.inputHandler.setBuffer("");
      }
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

  // Keyboard-safe padding using visualViewport
  useEffect(() => {
    if (!window.visualViewport) return;

    const updatePadding = () => {
      if (!terminalRef.current) return;
      const vv = window.visualViewport!;
      const keyboardHeight = Math.max(
        0,
        window.innerHeight - vv.height - vv.offsetTop
      );
      const lineHeight = terminalRef.current.options?.fontSize
        ? terminalRef.current.options.fontSize * 1.5
        : 24;
      const extra =
        hiddenInputRef.current === document.activeElement ? lineHeight * 2 : 0;
      terminalRef.current.setBottomPadding(
        baseBottomPaddingRef.current + keyboardHeight + extra
      );
      if (hiddenInputRef.current === document.activeElement) {
        terminalRef.current.scrollToLatest({ extraPadding: lineHeight * 1.5 });
      }
    };

    window.visualViewport.addEventListener("resize", updatePadding);
    window.visualViewport.addEventListener("scroll", updatePadding);
    return () => {
      window.visualViewport?.removeEventListener(
        "resize",
        updatePadding as any
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        updatePadding as any
      );
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-[#090812] overflow-hidden"
      style={{ touchAction: "none" }}
    >
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="relative w-full h-full"
        style={{ height: "100vh" }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            minHeight: "1px",
            background: "#090812",
          }}
          width={(() => {
            if (typeof window === "undefined") return undefined as any;
            const dpr = window.devicePixelRatio || 1;
            const el = containerRef.current;
            const w = el ? el.clientWidth : undefined;
            return w ? Math.max(1, Math.floor(w * dpr)) : undefined;
          })()}
          height={(() => {
            if (typeof window === "undefined") return undefined as any;
            const dpr = window.devicePixelRatio || 1;
            const el = containerRef.current;
            const h = el ? el.clientHeight : undefined;
            return h ? Math.max(1, Math.floor(h * dpr)) : undefined;
          })()}
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
          onFocus={() => {
            if (!terminalRef.current) return;
            const lineHeight = terminalRef.current.options?.fontSize
              ? terminalRef.current.options.fontSize * 1.5
              : 24;
            const vv = window.visualViewport;
            const keyboardHeight = vv
              ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
              : 0;
            terminalRef.current.setBottomPadding(
              baseBottomPaddingRef.current + keyboardHeight + lineHeight * 2
            );
            // Ensure the input line is visible even as the keyboard animates
            const settleFrames = 6;
            let frame = 0;
            const tick = () => {
              terminalRef.current?.scrollToLatest({
                extraPadding: lineHeight * 1.5,
              });
              frame++;
              if (frame < settleFrames) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }}
          onBlur={() => {
            terminalRef.current?.setBottomPadding(baseBottomPaddingRef.current);
          }}
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
