import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// Define media track interface
interface MediaTrack {
  title: string;
  path: string;
  duration: number;
}

export async function GET() {
  try {
    // Define base tracks that are always available
    const baseTracks: MediaTrack[] = [
      {
        title: "Quantum Resonance",
        path: "/media/quantum_resonance.mp3",
        duration: 180,
      },
      {
        title: "Neural Interface",
        path: "/media/neural_interface.mp3",
        duration: 240,
      },
      {
        title: "Digital Dreams",
        path: "/media/digital_dreams.mp3",
        duration: 195,
      },
    ];

    // Return the tracks
    return NextResponse.json(baseTracks);
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}
