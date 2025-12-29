"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ArtifactScanPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    async function loadArtifact() {
      try {
        const res = await fetch(`/api/artifacts?code=${code}`);
        const data = await res.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setArtifact(data.artifact);
          
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                await fetch("/api/artifacts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "scan",
                    code,
                    location: {
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                    },
                    userAgent: navigator.userAgent,
                  }),
                });
                setScanned(true);
              },
              async () => {
                await fetch("/api/artifacts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "scan",
                    code,
                    userAgent: navigator.userAgent,
                  }),
                });
                setScanned(true);
              }
            );
          } else {
            await fetch("/api/artifacts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "scan",
                code,
                userAgent: navigator.userAgent,
              }),
            });
            setScanned(true);
          }
        }
      } catch (e) {
        setError("Failed to load artifact");
      }
      setLoading(false);
    }

    loadArtifact();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-cyan-500 flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">◈</div>
          <div className="tracking-widest">DECODING ARTIFACT...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="text-4xl mb-4">✕</div>
          <div className="tracking-widest mb-4">ARTIFACT NOT FOUND</div>
          <div className="text-cyan-700 text-sm">{code}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-cyan-500 font-mono p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="border-2 border-cyan-800 p-6">
          <div className="text-center mb-6">
            <div className="text-cyan-400 text-xs tracking-widest mb-2">PROJECT 89</div>
            <div className="text-2xl text-cyan-300 tracking-widest">ARTIFACT DETECTED</div>
          </div>

          <div className="border border-cyan-900 p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-cyan-700">CODE:</span>
              <span className="text-cyan-400">{artifact.code}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-cyan-700">TYPE:</span>
              <span className="text-cyan-400">{artifact.type}</span>
            </div>
            {artifact.name && (
              <div className="flex justify-between mb-2">
                <span className="text-cyan-700">NAME:</span>
                <span className="text-cyan-400">{artifact.name}</span>
              </div>
            )}
            <div className="flex justify-between mb-2">
              <span className="text-cyan-700">DEPLOYED BY:</span>
              <span className="text-cyan-400">
                {artifact.user?.profile?.codename || artifact.user?.handle || "UNKNOWN"}
              </span>
            </div>
            {artifact.zone && (
              <div className="flex justify-between">
                <span className="text-cyan-700">ZONE:</span>
                <span className="text-cyan-400">{artifact.zone}</span>
              </div>
            )}
          </div>

          {artifact.description && (
            <div className="border border-cyan-900 p-4 mb-6">
              <div className="text-cyan-700 text-xs mb-2">MESSAGE:</div>
              <div className="text-cyan-400">{artifact.description}</div>
            </div>
          )}

          <div className="text-center text-cyan-700 text-sm mb-6">
            {scanned && (
              <div className="text-green-500 mb-2">✓ SCAN RECORDED</div>
            )}
            <div>SCANS: {artifact.scanCount + (scanned ? 1 : 0)}</div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/")}
              className="w-full border-2 border-cyan-500 text-cyan-400 py-3 tracking-widest hover:bg-cyan-500/20 transition-colors"
            >
              ENTER THE SIMULATION
            </button>
            
            <button
              onClick={() => router.push(`/?ref=${artifact.user?.referralCode || artifact.code}`)}
              className="w-full border border-cyan-800 text-cyan-600 py-2 text-sm tracking-widest hover:border-cyan-600 transition-colors"
            >
              JOIN AS AGENT
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-cyan-900 text-xs">
          <div>YOU HAVE DISCOVERED A NODE IN THE NETWORK</div>
          <div className="mt-1">THE PATTERN IS SPREADING</div>
        </div>
      </div>
    </div>
  );
}
