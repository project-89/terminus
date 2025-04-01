"use client";

import { useEffect, useRef, useState } from "react";

export function VideoLanding() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle video loaded
  const handleVideoLoaded = () => {
    setIsLoaded(true);
    // Show controls briefly when video loads
    setShowControls(true);

    // Add a slight delay before showing the video for a smooth fade-in
    setTimeout(() => {
      setFadeIn(true);
    }, 200);

    // Hide controls after a few seconds
    timeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Toggle mute state
  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);

      // Show controls for a brief period when toggled
      setShowControls(true);

      // Clear existing timeout if any
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  };

  // Show controls on mouse movement
  const handleMouseMove = () => {
    setShowControls(true);

    // Clear existing timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Fill viewport completely and handle resize
  useEffect(() => {
    function updateVideoSize() {
      if (videoRef.current && containerRef.current) {
        const windowRatio = window.innerWidth / window.innerHeight;
        const videoRatio = 16 / 9; // Assuming standard video ratio

        if (windowRatio < videoRatio) {
          // Window is taller than video ratio - fit to width and center vertically
          videoRef.current.style.width = "100vw";
          videoRef.current.style.height = "auto";
          videoRef.current.style.top = "50%";
          videoRef.current.style.left = "0";
          videoRef.current.style.transform = "translateY(-50%)";
        } else {
          // Window is wider than video ratio - fit to height and center horizontally
          videoRef.current.style.width = "auto";
          videoRef.current.style.height = "100vh";
          videoRef.current.style.left = "50%";
          videoRef.current.style.top = "0";
          videoRef.current.style.transform = "translateX(-50%)";
        }
      }
    }

    // Update on mount
    updateVideoSize();

    // Update on resize
    window.addEventListener("resize", updateVideoSize);
    return () => window.removeEventListener("resize", updateVideoSize);
  }, [isLoaded]); // Also update when video is loaded

  // Auto-play when component mounts
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      // Most browsers require videos to be muted for autoplay
      videoElement.muted = true;

      // Attempt to play
      videoElement.play().catch((error) => {
        console.warn("Autoplay prevented:", error);
      });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-black m-0 p-0"
      onMouseMove={handleMouseMove}
      style={{ cursor: "auto" }} // Always show cursor for better control discoverability
    >
      {/* Loading indicator - only shown before video is loaded */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-12 h-12 relative">
            <div className="absolute w-12 h-12 border-4 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Video element with fade-in effect */}
      <video
        ref={videoRef}
        style={{
          position: "fixed",
          minWidth: "100%",
          minHeight: "100%",
          objectFit: "cover",
          zIndex: 1,
        }}
        className={`transition-opacity duration-1000 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
        playsInline
        muted
        autoPlay
        loop
        controls
        controlsList="nodownload"
        preload="auto"
        onLoadedData={handleVideoLoaded}
      >
        <source src="/media/project89_trailer.mov" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Sound toggle button - only show when video is loaded */}
      {isLoaded && (
        <button
          onClick={toggleMute}
          className={`absolute bottom-8 right-8 z-20 bg-black/50 hover:bg-black/70 transition-all duration-300 p-4 rounded-full ${
            showControls ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          aria-label={isMuted ? "Unmute sound" : "Mute sound"}
        >
          {isMuted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
