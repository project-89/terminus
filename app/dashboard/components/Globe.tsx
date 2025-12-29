"use client";

import { useEffect, useState, useMemo, useRef } from "react";

interface Agent {
  id: string;
  handle: string | null;
  layer: number;
  trustScore: number;
  lat?: number;
  lng?: number;
  location?: { lat: number; lng: number; city?: string; country?: string } | null;
  stats?: { totalSessions: number; totalMinutes: number; daysSinceLast: number | null };
  missions?: { completed: number; total: number };
}

interface GlobeProps {
  agents: Agent[];
  onAgentClick?: (agent: Agent) => void;
  showLegend?: boolean;
}

const LAYER_COLORS: Record<number, string> = {
  0: "#00ffff",
  1: "#00ddff",
  2: "#00ff88",
  3: "#ffcc00",
  4: "#ff4444",
  5: "#ff00ff",
};

const DEMO_LOCATIONS = [
  { city: "San Francisco", country: "USA", lat: 37.7749, lng: -122.4194 },
  { city: "New York", country: "USA", lat: 40.7128, lng: -74.0060 },
  { city: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
  { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { city: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050 },
  { city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { city: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { city: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780 },
  { city: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777 },
  { city: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { city: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
  { city: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { city: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437 },
  { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
  { city: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
  { city: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241 },
  { city: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686 },
  { city: "Hong Kong", country: "China", lat: 22.3193, lng: 114.1694 },
];

function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) / 2147483647;
}

export default function Globe({ agents, onAgentClick, showLegend = true }: GlobeProps) {
  const [GlobeGL, setGlobeGL] = useState<any>(null);
  const [globeEl, setGlobeEl] = useState<any>(null);
  const [hoveredAgent, setHoveredAgent] = useState<Agent | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("react-globe.gl").then((mod) => setGlobeGL(() => mod.default));
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (globeEl) {
      const controls = globeEl.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;
      globeEl.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
      
      const stopAutoRotate = () => { controls.autoRotate = false; };
      controls.addEventListener("start", stopAutoRotate);
      return () => controls.removeEventListener("start", stopAutoRotate);
    }
  }, [globeEl]);

  const agentsWithCoords = useMemo(() => {
    return agents.map((agent, index) => {
      if (agent.lat !== undefined && agent.lng !== undefined) {
        return { ...agent, lat: agent.lat, lng: agent.lng };
      }
      if (agent.location?.lat !== undefined && agent.location?.lng !== undefined) {
        return { ...agent, lat: agent.location.lat, lng: agent.location.lng };
      }
      const locationIndex = Math.floor(seededRandom(agent.id) * DEMO_LOCATIONS.length);
      const loc = DEMO_LOCATIONS[locationIndex];
      const jitter = seededRandom(agent.id + "jitter") * 5 - 2.5;
      return {
        ...agent,
        lat: loc.lat + jitter,
        lng: loc.lng + jitter,
        location: { ...loc },
      };
    });
  }, [agents]);

  const ringsData = useMemo(() => {
    return agentsWithCoords.map(agent => ({
      lat: agent.lat,
      lng: agent.lng,
      maxR: 3 + agent.layer,
      propagationSpeed: 2,
      repeatPeriod: 1500 + (agent.layer * 300),
      color: LAYER_COLORS[agent.layer],
    }));
  }, [agentsWithCoords]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  if (!GlobeGL) {
    return (
      <div ref={containerRef} className="flex items-center justify-center h-full w-full bg-black">
        <div className="text-cyan-400 animate-pulse font-mono tracking-widest">ESTABLISHING UPLINK...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden" onMouseMove={handleMouseMove}>
      {showLegend && (
        <div className="absolute top-4 left-4 z-10 bg-black/90 border-2 border-cyan-800 p-3">
          <div className="text-sm text-cyan-400 tracking-widest mb-2 border-b border-cyan-500/30 pb-1">NETWORK STATUS</div>
          <div className="text-cyan-400 font-mono">
            <span className="text-2xl font-bold text-green-400">{agentsWithCoords.length}</span>
            <span className="text-cyan-600 ml-2">NODES ONLINE</span>
          </div>
          <div className="mt-2 space-y-1">
            {[0, 1, 2, 3, 4, 5].map((layer) => {
              const count = agents.filter((a) => a.layer === layer).length;
              if (count === 0) return null;
              const labels = ["UNVERIFIED", "INITIATE", "AGENT", "OPERATIVE", "HANDLER", "ARCHITECT"];
              return (
                <div key={layer} className="flex items-center gap-2 text-xs font-mono">
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: LAYER_COLORS[layer], boxShadow: `0 0 10px ${LAYER_COLORS[layer]}` }} />
                  <span className="text-cyan-600 w-20">{labels[layer]}</span>
                  <span className="text-cyan-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hoveredAgent && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
        >
          <div className="bg-black/95 border-2 border-cyan-500 p-4 min-w-[280px] shadow-lg shadow-cyan-500/20">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-cyan-500 text-xs tracking-widest">OPERATIVE</div>
                <div className="text-xl text-cyan-300 font-bold">
                  {hoveredAgent.handle || `AGENT-${hoveredAgent.id.slice(0, 8)}`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: LAYER_COLORS[hoveredAgent.layer] }}>L{hoveredAgent.layer}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center border-t border-cyan-800 pt-2 mt-2">
              <div>
                <div className="text-lg font-bold text-cyan-300">{hoveredAgent.stats?.totalSessions || 0}</div>
                <div className="text-xs text-cyan-700">SESSIONS</div>
              </div>
              <div>
                <div className="text-lg font-bold text-cyan-300">{hoveredAgent.missions?.completed || 0}/{hoveredAgent.missions?.total || 0}</div>
                <div className="text-xs text-cyan-700">MISSIONS</div>
              </div>
              <div>
                <div className="text-lg font-bold text-cyan-300">{(hoveredAgent.trustScore * 100).toFixed(0)}%</div>
                <div className="text-xs text-cyan-700">TRUST</div>
              </div>
            </div>
            {hoveredAgent.location && (
              <div className="text-xs text-cyan-600 mt-2 pt-2 border-t border-cyan-800">
                {(hoveredAgent.location as any).city}, {(hoveredAgent.location as any).country}
              </div>
            )}
            <div className="text-xs text-cyan-600 mt-2">
              {hoveredAgent.stats?.daysSinceLast === 0 ? (
                <span className="text-green-400">● ONLINE NOW</span>
              ) : hoveredAgent.stats?.daysSinceLast !== null ? (
                `Last active ${hoveredAgent.stats.daysSinceLast}d ago`
              ) : "No activity recorded"}
            </div>
            <div className="text-xs text-cyan-700 mt-2 pt-2 border-t border-cyan-800">CLICK FOR FULL DOSSIER →</div>
          </div>
        </div>
      )}

      <GlobeGL
        ref={setGlobeEl}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        
        pointsData={agentsWithCoords}
        pointLat="lat"
        pointLng="lng"
        pointColor={(d: any) => LAYER_COLORS[d.layer] || "#00ff88"}
        pointAltitude={(d: any) => 0.02 + d.layer * 0.03}
        pointRadius={(d: any) => 0.6 + d.layer * 0.2}
        pointResolution={16}
        onPointClick={(point: any) => onAgentClick?.(point as Agent)}
        onPointHover={(point: any) => setHoveredAgent(point as Agent | null)}
        
        ringsData={ringsData}
        ringLat="lat"
        ringLng="lng"
        ringColor="color"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringAltitude={0.015}
        
        atmosphereColor="#00aaff"
        atmosphereAltitude={0.2}
        
        hexPolygonsData={[]}
        
        width={dimensions.width}
        height={dimensions.height}
      />

      <div className="absolute bottom-4 right-4 z-10 text-right">
        <div className="text-cyan-700 text-xs tracking-widest">OVERWATCH GLOBAL NETWORK</div>
        <div className="flex items-center gap-2 justify-end mt-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
          <span className="text-green-400 text-sm tracking-widest">LIVE</span>
        </div>
      </div>
    </div>
  );
}
