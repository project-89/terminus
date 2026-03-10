"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Terminal, TERMINAL_COLORS } from "@/app/lib/terminal/Terminal";
import { FluidScreen } from "@/app/lib/terminal/screens/FluidScreen";
import { analytics } from "@/app/lib/analytics";
import { ScreenRouter } from "@/app/lib/terminal/ScreenRouter";
import { TerminalContext } from "@/app/lib/terminal/TerminalContext";
import { ShaderOverlay } from "./ShaderOverlay";
import { ImageIntruder } from "./ImageIntruder";
import { PointsTracker } from "./PointsTracker";
import { toolEvents } from "@/app/lib/terminal/tools/registry";

export function TerminalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);
  const touchVelocityRef = useRef<number>(0);
  const lastTouchYRef = useRef<number>(0);
  const lastTouchTimeRef = useRef<number>(0);
  const momentumFrameRef = useRef<number>(0);
  const baseBottomPaddingRef = useRef<number>(0);

  // Shader state
  const [shaderActive, setShaderActive] = useState(false);
  const [shaderCode, setShaderCode] = useState<string>("");
  const [shaderDuration, setShaderDuration] = useState<number>(5000);


  const isMobile = () => {
    return typeof window !== "undefined" && window.innerWidth < 480;
  };

  const syncHiddenInputFromTerminal = useCallback((scrollToLatest = false) => {
    const terminal = terminalRef.current;
    const hiddenInput = hiddenInputRef.current;
    if (!terminal?.inputHandler || !hiddenInput) return;

    hiddenInput.value = terminal.inputHandler.getInputBuffer();
    const cursor = terminal.inputHandler.getCursorPosition();
    hiddenInput.setSelectionRange(cursor, cursor);

    if (scrollToLatest) {
      terminal.scrollToLatest();
    }
  }, []);

  const applyClipboardShortcut = useCallback(async (
    shortcut: "copy" | "paste" | "cut" | "select_all"
  ) => {
    const terminal = terminalRef.current;
    const hiddenInput = hiddenInputRef.current;
    if (!terminal?.inputHandler) return;

    const inputHandler = terminal.inputHandler;
    const buffer = inputHandler.getInputBuffer();
    const defaultCursor = inputHandler.getCursorPosition();
    const selectionStart = hiddenInput?.selectionStart ?? defaultCursor;
    const selectionEnd = hiddenInput?.selectionEnd ?? selectionStart;
    const hasSelection = selectionEnd > selectionStart;

    if (shortcut === "select_all") {
      hiddenInput?.setSelectionRange(0, buffer.length);
      return;
    }

    if (shortcut === "copy" || shortcut === "cut") {
      const textToCopy = hasSelection
        ? buffer.slice(selectionStart, selectionEnd)
        : buffer;
      if (!textToCopy) return;
      try {
        await navigator.clipboard.writeText(textToCopy);
      } catch (error) {
        console.warn("Clipboard write failed", error);
      }

      if (shortcut === "cut") {
        if (hasSelection) {
          const next =
            buffer.slice(0, selectionStart) + buffer.slice(selectionEnd);
          inputHandler.setBuffer(next);
          inputHandler.setCursorPosition(selectionStart);
        } else {
          inputHandler.setBuffer("");
          inputHandler.setCursorPosition(0);
        }
        syncHiddenInputFromTerminal(true);
      }
      return;
    }

    if (shortcut === "paste") {
      let pastedText = "";
      try {
        pastedText = await navigator.clipboard.readText();
      } catch (error) {
        console.warn("Clipboard read failed", error);
        return;
      }
      if (!pastedText) return;
      const normalizedPaste = pastedText.replace(/\r\n/g, "\n").replace(/\n/g, " ");
      const next =
        buffer.slice(0, selectionStart) +
        normalizedPaste +
        buffer.slice(selectionEnd);
      inputHandler.setBuffer(next);
      inputHandler.setCursorPosition(selectionStart + normalizedPaste.length);
      syncHiddenInputFromTerminal(true);
    }
  }, [syncHiddenInputFromTerminal]);

  // Handle tool events for shaders
  useEffect(() => {
    const handleShader = (params: any) => {
      if (params && params.glsl) {
        setShaderCode(params.glsl);
        setShaderDuration(params.duration || 5000);
        setShaderActive(true);
      }
    };

    toolEvents.on("tool:generate_shader", handleShader);
    return () => {
      toolEvents.off("tool:generate_shader", handleShader);
    };
  }, []);


  // Initialize terminal once
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Get existing terminal instance or create new one
    let terminal = Terminal.getInstance();
    if (!terminal) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      // Use window dimensions as fallback if container isn't fully laid out yet
      const width = rect.width > 100 ? rect.width : window.innerWidth;
      const height = rect.height > 100 ? rect.height : window.innerHeight;

      terminal = new Terminal(canvasRef.current, {
        width,
        height,
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

      // Preserve prior session state; do not clear here

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
    // Add a little extra baseline space to avoid browser bars covering content
    baseBottomPaddingRef.current = isMobile()
      ? Math.round(lineHeight * 3 + 16)
      : 0;
    terminal.setBottomPadding(baseBottomPaddingRef.current);

    // Cleanup
    return () => {
      if (terminalRef.current) {
        terminalRef.current.destroy();
        terminalRef.current = null;
      }
    };
  }, [applyClipboardShortcut]); // Rebind if clipboard handler changes

  // Handle resize - use ResizeObserver for reliable container size detection
  useEffect(() => {
    // Minimum valid dimensions to prevent shrinking bugs
    const MIN_SIZE = 100;

    function handleResize() {
      if (!canvasRef.current || !containerRef.current || !terminalRef.current)
        return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      // Only resize if we have valid dimensions above minimum threshold
      if (rect.width >= MIN_SIZE && rect.height >= MIN_SIZE) {
        terminalRef.current.resize(rect.width, rect.height);
      }
    }

    // Use ResizeObserver for container size changes (more reliable than window resize alone)
    const resizeObserver = new ResizeObserver((entries) => {
      // Debounce rapid resize events
      const entry = entries[0];
      if (entry && entry.contentRect.width >= MIN_SIZE && entry.contentRect.height >= MIN_SIZE) {
        handleResize();
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", handleResize);

    // Initial resize with multiple delayed attempts to ensure layout is complete
    // This handles cases where the container isn't fully laid out on first render
    handleResize();
    const delays = [50, 100, 200, 500];
    const timeouts = delays.map(delay => setTimeout(handleResize, delay));

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      timeouts.forEach(clearTimeout);
    };
  }, [applyClipboardShortcut]); // Rebind if clipboard handler changes

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
  }, [shaderActive]);

  // Handle keyboard input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if the event is from our managed input or another editable element.
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      if (!terminalRef.current) return;
      if (!terminalRef.current.getCommandAccess()) return;

      const key = e.key.toLowerCase();
      const withModifier = e.metaKey || e.ctrlKey;

      if (withModifier && ["v", "c", "x", "a"].includes(key)) {
        e.preventDefault();
        const shortcutMap = {
          v: "paste",
          c: "copy",
          x: "cut",
          a: "select_all",
        } as const;
        void applyClipboardShortcut(shortcutMap[key as keyof typeof shortcutMap]);
        return;
      }

      // Handle Enter key specially - need to process command, not just buffer
      if (e.key === "Enter" && !withModifier) {
        e.preventDefault();
        const command = terminalRef.current.inputHandler?.getInputBuffer() || "";
        terminalRef.current.inputHandler?.setBuffer("");
        terminalRef.current.processCommand(command);
        terminalRef.current.scrollToLatest();

        // Sync hidden input
        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = "";
        }
        return;
      }

      // Skip other modified shortcuts (screenshots, browser shortcuts, etc.)
      if (withModifier || e.altKey) {
        return;
      }

      if (
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
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
  }, [applyClipboardShortcut]);

  // Handle scrolling
  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      if (!terminalRef.current) return;
      e.preventDefault();
      const lineHeight = Math.max(
        12,
        (terminalRef.current.options.fontSize || 16) * 1.5
      );

      let linesToScroll = e.deltaY / lineHeight;
      if (e.deltaMode === 1) {
        // DOM_DELTA_LINE
        linesToScroll = e.deltaY;
      } else if (e.deltaMode === 2) {
        // DOM_DELTA_PAGE
        linesToScroll = (e.deltaY * window.innerHeight) / lineHeight;
      }

      // Prevent rare giant wheel spikes from jumping several screens at once.
      const clamped = Math.max(-24, Math.min(24, linesToScroll));
      if (Math.abs(clamped) > 0.001) {
        terminalRef.current.scroll(clamped);
      }
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

  // Touch gestures: 1:1 finger tracking with momentum on release
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stopMomentum = () => {
      if (momentumFrameRef.current) {
        cancelAnimationFrame(momentumFrameRef.current);
        momentumFrameRef.current = 0;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      stopMomentum();
      const t = e.touches[0];
      touchStartYRef.current = t.clientY;
      touchStartXRef.current = t.clientX;
      touchStartTimeRef.current = performance.now();
      lastTouchYRef.current = t.clientY;
      lastTouchTimeRef.current = performance.now();
      touchVelocityRef.current = 0;
      isScrollingRef.current = false;

      // Dismiss shader on interaction
      if (shaderActive) {
        setShaderActive(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!terminalRef.current) return;
      if (touchStartYRef.current === null) return;

      const t = e.touches[0];
      const dy = touchStartYRef.current - t.clientY;

      // If we haven't locked into scrolling yet, check threshold
      if (!isScrollingRef.current) {
        const dx = (touchStartXRef.current ?? t.clientX) - t.clientX;
        const moved = Math.hypot(dx, dy);
        if (moved > 5) {
          isScrollingRef.current = true;
        }
      }

      if (isScrollingRef.current) {
        e.preventDefault();

        // 1:1 pixel tracking — move exactly as far as the finger moved
        const pixelDelta = lastTouchYRef.current - t.clientY;
        terminalRef.current.scrollByPixels(pixelDelta);

        // Track velocity (pixels per ms) using exponential smoothing
        const now = performance.now();
        const dt = now - lastTouchTimeRef.current;
        if (dt > 0) {
          const instantVelocity = pixelDelta / dt;
          touchVelocityRef.current = touchVelocityRef.current * 0.4 + instantVelocity * 0.6;
        }

        lastTouchYRef.current = t.clientY;
        lastTouchTimeRef.current = now;
      }
    };

    const handleTouchEnd = () => {
      const now = performance.now();
      const duration = now - touchStartTimeRef.current;
      const wasScroll = isScrollingRef.current;

      // Reset touch state
      touchStartYRef.current = null;
      touchStartXRef.current = null;
      isScrollingRef.current = false;

      if (!wasScroll && duration < 220) {
        // Treat as tap
        if (terminalRef.current) {
          if (terminalRef.current.getCommandAccess()) {
            hiddenInputRef.current?.focus();
          } else {
            terminalRef.current.handleInput(" ");
          }
        }
        return;
      }

      // Momentum: only if finger was moving fast enough (> 0.3 px/ms)
      let velocity = touchVelocityRef.current;
      if (Math.abs(velocity) < 0.3) return;

      // Cap initial velocity
      velocity = Math.max(-4, Math.min(4, velocity));

      const friction = 0.95;
      const step = () => {
        if (!terminalRef.current || Math.abs(velocity) < 0.5) {
          momentumFrameRef.current = 0;
          return;
        }
        // Apply velocity as pixels per frame (~16ms)
        terminalRef.current.scrollByPixels(velocity * 16);
        velocity *= friction;
        momentumFrameRef.current = requestAnimationFrame(step);
      };
      momentumFrameRef.current = requestAnimationFrame(step);
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
      stopMomentum();
      container.removeEventListener("touchstart", handleTouchStart as any);
      container.removeEventListener("touchmove", handleTouchMove as any);
      container.removeEventListener("touchend", handleTouchEnd as any);
      container.removeEventListener("touchcancel", handleTouchEnd as any);
    };
  }, [shaderActive]);

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
  async function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Dismiss active shader on input
    if (shaderActive) {
      setShaderActive(false);
    }

    if (!terminalRef.current) return;
    const key = e.key.toLowerCase();
    const withModifier = e.metaKey || e.ctrlKey;

    if (withModifier && ["v", "c", "x", "a"].includes(key)) {
      e.preventDefault();
      const shortcutMap = {
        v: "paste",
        c: "copy",
        x: "cut",
        a: "select_all",
      } as const;
      await applyClipboardShortcut(shortcutMap[key as keyof typeof shortcutMap]);
      return;
    }

    e.preventDefault();

    // Handle special keys
    if (e.key === "Enter" && !withModifier) {
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
          const pos = terminalRef.current.inputHandler.getCursorPosition();
          hiddenInputRef.current.setSelectionRange(pos, pos);
        }
      });
      return;
    }

    // Handle delete
    if (e.key === "Delete") {
      terminalRef.current.handleInput(e.key);
      requestAnimationFrame(() => {
        if (hiddenInputRef.current && terminalRef.current?.inputHandler) {
          hiddenInputRef.current.value =
            terminalRef.current.inputHandler.getInputBuffer();
          const pos = terminalRef.current.inputHandler.getCursorPosition();
          hiddenInputRef.current.setSelectionRange(pos, pos);
        }
      });
      return;
    }

    // Handle all other keyboard input through terminal
    if (e.key.length === 1 && !withModifier && !e.altKey) {
      terminalRef.current.handleInput(e.key);
    }

    // Sync hidden input with terminal's buffer and cursor position
    requestAnimationFrame(() => {
      if (hiddenInputRef.current && terminalRef.current?.inputHandler) {
        hiddenInputRef.current.value =
          terminalRef.current.inputHandler.getInputBuffer();
        const pos = terminalRef.current.inputHandler.getCursorPosition();
        hiddenInputRef.current.setSelectionRange(pos, pos);
        terminalRef.current.scrollToLatest();
      }
    });
  }

  // Add focus management
  // Keyboard-safe padding using visualViewport (and resize terminal on vv changes)
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

      // Also trigger a terminal resize to match container size when visual viewport changes
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        terminalRef.current.resize(rect.width, rect.height);
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
        style={{
          // Use dynamic viewport height to avoid iOS toolbar/keyboard issues
          height: "100dvh",
        }}
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
          // Canvas dimensions are managed by the Terminal/Renderer resize handler
          // Do NOT set width/height inline - it causes shrinking bugs on re-render
        />
        <ShaderOverlay 
          active={shaderActive} 
          fragmentShader={shaderCode} 
          duration={shaderDuration} 
          sourceCanvas={canvasRef.current}
          onComplete={() => setShaderActive(false)} 
        />
        <ImageIntruder />
        <PointsTracker />
        <input
          ref={hiddenInputRef}
          data-terminal-input="true"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
          enterKeyHint="send"
          onKeyDown={handleInputKeyDown}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text/plain");
            if (!pasted || !terminalRef.current?.inputHandler) return;
            const inputHandler = terminalRef.current.inputHandler;
            const buffer = inputHandler.getInputBuffer();
            const start = e.currentTarget.selectionStart ?? inputHandler.getCursorPosition();
            const end = e.currentTarget.selectionEnd ?? start;
            const normalizedPaste = pasted.replace(/\r\n/g, "\n").replace(/\n/g, " ");
            const next = buffer.slice(0, start) + normalizedPaste + buffer.slice(end);
            inputHandler.setBuffer(next);
            inputHandler.setCursorPosition(start + normalizedPaste.length);
            syncHiddenInputFromTerminal(true);
          }}
          onInput={(e) => {
            // Fallback for mobile paste/autocorrect that bypasses onPaste
            if (!terminalRef.current?.inputHandler) return;
            const el = e.currentTarget as HTMLInputElement;
            const currentBuffer = terminalRef.current.inputHandler.getInputBuffer();
            if (el.value !== currentBuffer) {
              const normalized = el.value.replace(/\r\n/g, "\n").replace(/\n/g, " ");
              terminalRef.current.inputHandler.setBuffer(normalized);
              terminalRef.current.inputHandler.setCursorPosition(el.selectionStart ?? normalized.length);
              terminalRef.current.render();
            }
          }}
          onFocus={() => {
            if (!terminalRef.current) return;
            const lineHeight = terminalRef.current.options?.fontSize
              ? terminalRef.current.options.fontSize * 1.5
              : 24;
            const vv = window.visualViewport;
            const keyboardHeight = vv
              ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
              : 0;
            // Extra safe-area fudge for mobile browser bars
            const SAFE_BOTTOM = 16;
            terminalRef.current.setBottomPadding(
              baseBottomPaddingRef.current + keyboardHeight + lineHeight * 2 + SAFE_BOTTOM
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
