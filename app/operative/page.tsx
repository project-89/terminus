"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface OperativeProfile {
  id: string;
  agentId: string;
  handle: string | null;
  layer: number;
  trustScore: number;
  referralCode: string | null;
  identityLocked: boolean;
  createdAt: string;
  stats: {
    totalMissions: number;
    completedMissions: number;
    recruitsCount: number;
    totalPoints: number;
    daysActive: number;
  };
  activeMissions: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
  availableMissions: Array<{
    id: string;
    title: string;
    type: string;
    difficulty: string;
    briefing: string;
  }>;
  recruits: Array<{
    agentId: string;
    layer: number;
    active: boolean;
    recruitedAt: string;
  }>;
}

interface TerminalMessage {
  role: "user" | "logos";
  content: string;
  timestamp: Date;
}

const LAYER_NAMES = ["THE MASK", "THE BLEED", "THE CRACK", "THE WHISPER", "THE CALL", "THE REVEAL"];

function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  const [glitch, setGlitch] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 100);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`${className} ${glitch ? "animate-pulse text-red-400" : ""}`}>
      {glitch ? text.split("").map((c, i) => Math.random() > 0.7 ? String.fromCharCode(33 + Math.floor(Math.random() * 93)) : c).join("") : text}
    </span>
  );
}

function ScanLine() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-[0.03]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500 to-transparent h-[10px] animate-scan" />
    </div>
  );
}

function HexGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <polygon points="24.8,22 37.3,29.2 37.3,43.4 24.8,50.6 12.3,43.4 12.3,29.2" fill="none" stroke="cyan" strokeWidth="0.5"/>
            <polygon points="0,0 12.5,7.2 12.5,21.4 0,28.6 -12.5,21.4 -12.5,7.2" fill="none" stroke="cyan" strokeWidth="0.5"/>
            <polygon points="50,0 62.5,7.2 62.5,21.4 50,28.6 37.5,21.4 37.5,7.2" fill="none" stroke="cyan" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </div>
  );
}

function TrustBar({ score, showLabel = true }: { score: number; showLabel?: boolean }) {
  const pct = Math.min(score * 100, 100);
  const segments = 20;
  const filledSegments = Math.floor((pct / 100) * segments);
  
  return (
    <div className="space-y-1">
      <div className="flex gap-[2px]">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-3 flex-1 transition-all duration-300 ${
              i < filledSegments 
                ? i < segments * 0.5 ? "bg-cyan-600" : i < segments * 0.8 ? "bg-cyan-400" : "bg-cyan-300 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                : "bg-cyan-900/30"
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <div className="flex justify-between text-[10px]">
          <span className="text-cyan-700">TRUST INDEX</span>
          <span className="text-cyan-400 font-bold">{pct.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}

function LogosTerminal({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<TerminalMessage[]>([
    { role: "logos", content: "◈ LOGOS INTERFACE ACTIVE ◈\n\nSecure channel established.\n\nI am your handler for network operations. Mission planning, intelligence analysis, strategic guidance - speak freely.\n\nThe simulation bends to those who understand its nature.", timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      const res = await fetch("/api/operative/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: userMessage, context: "operative_dashboard" }),
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { 
        role: "logos", 
        content: data.response || "Signal interrupted. Retry transmission.", 
        timestamp: new Date() 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: "logos", 
        content: "◈ CONNECTION SEVERED ◈\n\nThe network is experiencing dimensional interference. Stand by.", 
        timestamp: new Date() 
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-black/80 border border-cyan-700 shadow-[0_0_30px_rgba(0,255,255,0.1)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none" />
      
      <div className="bg-gradient-to-r from-cyan-900/50 via-cyan-800/30 to-cyan-900/50 px-4 py-3 border-b border-cyan-700 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-cyan-400 animate-ping opacity-50" />
          </div>
          <span className="text-cyan-300 font-bold tracking-[0.3em] text-sm">LOGOS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-cyan-700 text-xs tracking-widest">ENCRYPTED</span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1 h-3 bg-cyan-600 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-4 relative">
        {messages.map((msg, i) => (
          <div key={i} className={`${msg.role === "user" ? "ml-8" : "mr-8"}`}>
            <div className={`text-[10px] mb-1 tracking-widest ${msg.role === "user" ? "text-right text-cyan-600" : "text-cyan-700"}`}>
              {msg.role === "user" ? "OPERATIVE" : "◈ LOGOS"} • {msg.timestamp.toLocaleTimeString()}
            </div>
            <div className={`p-3 border ${
              msg.role === "user" 
                ? "border-cyan-700 bg-cyan-900/20 text-cyan-300" 
                : "border-cyan-600 bg-gradient-to-r from-cyan-900/30 to-transparent text-cyan-400"
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="mr-8">
            <div className="text-[10px] mb-1 tracking-widest text-cyan-700">◈ LOGOS • processing...</div>
            <div className="p-3 border border-cyan-600 bg-gradient-to-r from-cyan-900/30 to-transparent">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-cyan-700 p-4 bg-black/50">
        <div className="flex gap-3 items-center">
          <span className="text-cyan-500 text-lg">◈</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="transmit query..."
            disabled={loading}
            className="flex-1 bg-transparent text-cyan-300 placeholder:text-cyan-800 focus:outline-none font-mono text-sm tracking-wide"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 border border-cyan-600 text-cyan-400 text-xs tracking-[0.2em] hover:bg-cyan-900/50 hover:border-cyan-400 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            TRANSMIT
          </button>
        </div>
      </form>
    </div>
  );
}

function MissionCard({ 
  mission, 
  onAccept,
  isActive = false 
}: { 
  mission: { id: string; title: string; type: string; status?: string; difficulty?: string; briefing?: string };
  onAccept?: () => void;
  isActive?: boolean;
}) {
  const typeConfig: Record<string, { border: string; bg: string; icon: string }> = {
    observation: { border: "border-blue-500", bg: "from-blue-900/30", icon: "◎" },
    observe: { border: "border-blue-500", bg: "from-blue-900/30", icon: "◎" },
    infiltration: { border: "border-purple-500", bg: "from-purple-900/30", icon: "◇" },
    recruitment: { border: "border-green-500", bg: "from-green-900/30", icon: "◈" },
    analysis: { border: "border-yellow-500", bg: "from-yellow-900/30", icon: "△" },
    dead_drop: { border: "border-red-500", bg: "from-red-900/30", icon: "▽" },
    decode: { border: "border-cyan-500", bg: "from-cyan-900/30", icon: "◆" },
  };

  const config = typeConfig[mission.type] || typeConfig.decode;

  const statusColors: Record<string, string> = {
    ACCEPTED: "text-cyan-400 border-cyan-500",
    SUBMITTED: "text-yellow-400 border-yellow-500",
    REVIEWING: "text-orange-400 border-orange-500",
    COMPLETED: "text-green-400 border-green-500",
    FAILED: "text-red-400 border-red-500",
  };

  return (
    <div className={`border ${config.border} bg-gradient-to-br ${config.bg} to-transparent p-4 relative group hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all`}>
      <div className="absolute top-2 right-2 text-2xl opacity-20 group-hover:opacity-40 transition-opacity">
        {config.icon}
      </div>
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="text-cyan-200 font-bold tracking-wide">{mission.title}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-cyan-700 text-[10px] uppercase tracking-widest">{mission.type}</span>
            {mission.difficulty && (
              <>
                <span className="text-cyan-800">•</span>
                <span className="text-cyan-600 text-[10px] uppercase tracking-widest">{mission.difficulty}</span>
              </>
            )}
          </div>
        </div>
        {isActive && mission.status && (
          <span className={`text-[10px] font-bold px-2 py-1 border ${statusColors[mission.status] || "text-cyan-500 border-cyan-700"}`}>
            {mission.status}
          </span>
        )}
      </div>
      
      {mission.briefing && (
        <p className="text-cyan-500/80 text-sm mt-2 line-clamp-2 leading-relaxed">{mission.briefing}</p>
      )}
      
      {onAccept && (
        <button
          onClick={onAccept}
          className="mt-4 w-full bg-black/50 border border-cyan-500 py-2.5 text-cyan-300 text-xs tracking-[0.2em] hover:bg-cyan-900/50 hover:text-cyan-100 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all"
        >
          ◈ ACCEPT MISSION
        </button>
      )}
    </div>
  );
}

function RecruitTree({ recruits, agentId }: { recruits: OperativeProfile["recruits"]; agentId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-cyan-400 rotate-45 flex items-center justify-center">
          <div className="w-2 h-2 bg-cyan-400" />
        </div>
        <span className="text-cyan-300 font-bold tracking-wide">{agentId}</span>
        <span className="text-cyan-700 text-xs border border-cyan-800 px-2 py-0.5">PRIMARY</span>
      </div>
      
      {recruits.length > 0 ? (
        <div className="ml-6 border-l-2 border-cyan-800 pl-6 space-y-3">
          {recruits.map((recruit, i) => (
            <div key={recruit.agentId} className="flex items-center gap-3 relative">
              <div className="absolute -left-[26px] w-4 h-[2px] bg-cyan-800" />
              <div className={`w-2 h-2 rotate-45 ${recruit.active ? "bg-green-400 shadow-[0_0_10px_rgba(0,255,0,0.5)]" : "bg-cyan-800"}`} />
              <span className={recruit.active ? "text-cyan-400" : "text-cyan-700"}>{recruit.agentId}</span>
              <span className={`text-[10px] ${recruit.active ? "text-green-400" : "text-cyan-800"}`}>
                L{recruit.layer} {recruit.active && "• ACTIVE"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="ml-6 pl-6 text-cyan-700 text-sm border-l-2 border-cyan-900">
          <div className="text-cyan-600 mb-1">NO ACTIVE NODES</div>
          <div className="text-cyan-800 text-xs">Deploy your activation code to expand the network.</div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, sublabel, glow = false }: { label: string; value: string | number; sublabel?: string; glow?: boolean }) {
  return (
    <div className={`border border-cyan-800 bg-black/40 p-4 text-center relative overflow-hidden ${glow ? "shadow-[0_0_20px_rgba(0,255,255,0.15)]" : ""}`}>
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent" />
      <div className="relative">
        <div className="text-cyan-700 text-[10px] tracking-[0.2em] mb-2">{label}</div>
        <div className={`text-3xl font-bold ${glow ? "text-cyan-300" : "text-cyan-400"}`}>{value}</div>
        {sublabel && <div className="text-cyan-600 text-[10px] mt-1">{sublabel}</div>}
      </div>
    </div>
  );
}

export default function OperativeDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<OperativeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "missions" | "network" | "terminal">("overview");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const userId = typeof window !== "undefined" ? localStorage.getItem("p89_userId") : null;
    
    if (!userId) {
      router.push("/");
      return;
    }

    fetch(`/api/operative/profile?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error || data.layer < 5) {
          router.push("/");
          return;
        }
        setProfile(data);
        setLoading(false);
      })
      .catch(() => router.push("/"));
  }, [router]);

  const handleAcceptMission = async (missionId: string) => {
    if (!profile) return;
    try {
      const res = await fetch("/api/operative/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.id, missionId, action: "accept" }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(prev => prev ? {
          ...prev,
          activeMissions: [...prev.activeMissions, data.mission],
          availableMissions: prev.availableMissions.filter(m => m.id !== missionId),
        } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center font-mono overflow-hidden relative">
        <ScanLine />
        <HexGrid />
        <div className="text-center relative z-10">
          <div className="text-cyan-500 text-3xl tracking-[0.5em] mb-6 animate-pulse">PROJECT 89</div>
          <div className="text-cyan-700 tracking-[0.3em] text-sm">ESTABLISHING SECURE UPLINK</div>
          <div className="mt-6 flex justify-center gap-1">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="w-2 h-8 bg-cyan-800 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">◈</div>
          <div className="text-red-400 tracking-[0.3em]">ACCESS DENIED</div>
          <div className="text-red-700 text-sm mt-2">INSUFFICIENT CLEARANCE LEVEL</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-cyan-400 font-mono flex flex-col overflow-hidden">
      <ScanLine />
      <HexGrid />
      
      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        .animate-scan {
          animation: scan 8s linear infinite;
        }
      `}</style>

      <header className="bg-black/95 border-b border-cyan-700 px-6 py-4 relative z-40">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-transparent to-cyan-900/20" />
        
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-8">
            <div>
              <div className="text-cyan-600 text-[10px] tracking-[0.3em] mb-1">OPERATIVE TERMINAL</div>
              <GlitchText text={profile.agentId} className="text-2xl font-bold text-cyan-300 tracking-wide" />
            </div>
            
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-cyan-700 to-transparent" />
            
            <div>
              <div className="text-cyan-800 text-[10px] tracking-[0.2em]">CLEARANCE</div>
              <div className="text-cyan-400 font-bold">{LAYER_NAMES[profile.layer]}</div>
            </div>
            
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-cyan-700 to-transparent" />
            
            <div className="w-40">
              <TrustBar score={profile.trustScore} />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-cyan-800 text-[10px] tracking-[0.2em]">NETWORK CREDITS</div>
              <div className="text-cyan-300 font-bold text-xl">{profile.stats.totalPoints.toLocaleString()}</div>
            </div>
            
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-cyan-700 to-transparent" />
            
            <div className="text-right">
              <div className="text-cyan-700 text-xs font-mono">{time.toLocaleDateString()}</div>
              <div className="text-cyan-500 text-lg font-mono tracking-wider">{time.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 mt-4 relative">
          {(["overview", "missions", "network", "terminal"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 text-xs tracking-[0.2em] transition-all border-t-2 ${
                activeTab === tab
                  ? "text-cyan-300 bg-cyan-900/30 border-cyan-400"
                  : "text-cyan-700 bg-transparent border-transparent hover:text-cyan-500 hover:bg-cyan-900/10"
              }`}
            >
              {tab === "overview" && "◈ "}
              {tab === "missions" && "◇ "}
              {tab === "network" && "◎ "}
              {tab === "terminal" && "△ "}
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 relative z-10">
        {activeTab === "overview" && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4 space-y-6">
              <div className="bg-black/60 border border-cyan-800 p-6">
                <h3 className="text-cyan-500 text-xs tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="text-cyan-700">◈</span> OPERATIVE STATUS
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-700 text-sm">Designation</span>
                    <span className="text-cyan-300 font-bold">{profile.agentId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-700 text-sm">Handle</span>
                    <span className="text-cyan-400">{profile.handle || "[ CLASSIFIED ]"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-700 text-sm">Days Active</span>
                    <span className="text-cyan-400">{profile.stats.daysActive}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-700 text-sm">Identity Status</span>
                    <span className={`text-xs px-2 py-1 border ${profile.identityLocked ? "text-green-400 border-green-600 bg-green-900/20" : "text-yellow-400 border-yellow-600 bg-yellow-900/20"}`}>
                      {profile.identityLocked ? "◈ SECURED" : "⚠ UNSECURED"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatBox label="COMPLETED" value={profile.stats.completedMissions} glow />
                <StatBox label="TOTAL OPS" value={profile.stats.totalMissions} />
                <StatBox label="RECRUITS" value={profile.stats.recruitsCount} sublabel="NETWORK NODES" />
                <StatBox 
                  label="SUCCESS" 
                  value={profile.stats.totalMissions > 0 ? `${Math.round((profile.stats.completedMissions / profile.stats.totalMissions) * 100)}%` : "—"}
                />
              </div>

              {profile.referralCode && (
                <div className="bg-gradient-to-br from-cyan-900/40 to-transparent border border-cyan-600 p-6">
                  <h3 className="text-cyan-400 text-xs tracking-[0.3em] mb-3">ACTIVATION CODE</h3>
                  <div className="text-2xl font-bold text-cyan-300 text-center py-3 bg-black/60 border border-cyan-700 tracking-[0.2em] shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                    {profile.referralCode}
                  </div>
                  <p className="text-cyan-600 text-xs mt-3 text-center leading-relaxed">
                    Deploy this code to recruit new operatives into the network
                  </p>
                </div>
              )}
            </div>

            <div className="col-span-8 space-y-6">
              <div className="bg-black/60 border border-cyan-800 p-6">
                <h3 className="text-cyan-500 text-xs tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="text-cyan-700">◇</span> ACTIVE OPERATIONS
                </h3>
                {profile.activeMissions.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {profile.activeMissions.map((mission) => (
                      <MissionCard key={mission.id} mission={mission} isActive />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-cyan-900 bg-cyan-900/10">
                    <div className="text-cyan-700 text-4xl mb-3">◇</div>
                    <div className="text-cyan-600">No active operations</div>
                    <div className="text-cyan-800 text-sm mt-1">Access MISSIONS tab for available ops</div>
                  </div>
                )}
              </div>

              <div className="bg-black/60 border border-cyan-800 p-6">
                <h3 className="text-cyan-500 text-xs tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="text-cyan-700">◎</span> NETWORK TOPOLOGY
                </h3>
                <RecruitTree recruits={profile.recruits} agentId={profile.agentId} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "missions" && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8">
              <div className="bg-black/60 border border-cyan-800 p-6">
                <h3 className="text-cyan-500 text-xs tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="text-cyan-700">◇</span> AVAILABLE OPERATIONS
                </h3>
                {profile.availableMissions.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {profile.availableMissions.map((mission) => (
                      <MissionCard 
                        key={mission.id} 
                        mission={mission}
                        onAccept={() => handleAcceptMission(mission.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border border-cyan-900 bg-cyan-900/10">
                    <div className="text-cyan-600 text-6xl mb-4">◈</div>
                    <div className="text-cyan-500 tracking-wide">STANDBY FOR ORDERS</div>
                    <div className="text-cyan-800 text-sm mt-2">No operations currently available for your clearance level.</div>
                    <div className="text-cyan-700 text-xs mt-4">Consult LOGOS terminal for guidance.</div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-4 space-y-6">
              <div className="bg-black/60 border border-cyan-800 p-6">
                <h3 className="text-cyan-500 text-xs tracking-[0.3em] mb-4">OPERATION LOG</h3>
                <div className="space-y-3">
                  {profile.activeMissions.map((mission) => (
                    <div key={mission.id} className="border-l-2 border-cyan-600 pl-3 py-1">
                      <div className="text-cyan-400 text-sm font-bold">{mission.title}</div>
                      <div className="text-cyan-700 text-[10px] tracking-wide">
                        {mission.status} • {new Date(mission.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {profile.activeMissions.length === 0 && (
                    <div className="text-cyan-800 text-sm">No active operations</div>
                  )}
                </div>
              </div>

              <div className="bg-black/60 border border-cyan-800 p-6">
                <h3 className="text-cyan-500 text-xs tracking-[0.3em] mb-4">MISSION CLASSIFICATION</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { color: "bg-blue-500", name: "OBSERVATION", icon: "◎" },
                    { color: "bg-purple-500", name: "INFILTRATION", icon: "◇" },
                    { color: "bg-green-500", name: "RECRUITMENT", icon: "◈" },
                    { color: "bg-yellow-500", name: "ANALYSIS", icon: "△" },
                    { color: "bg-red-500", name: "DEAD DROP", icon: "▽" },
                  ].map(({ color, name, icon }) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className={`w-2 h-2 ${color}`} />
                      <span className="text-cyan-700 text-xs">{icon}</span>
                      <span className="text-cyan-500 text-xs tracking-wide">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "network" && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8">
              <div className="bg-black/60 border border-cyan-800 p-6">
                <h3 className="text-cyan-500 text-xs tracking-[0.3em] mb-6 flex items-center gap-2">
                  <span className="text-cyan-700">◎</span> RECRUITMENT TOPOLOGY
                </h3>
                <div className="min-h-[400px] flex items-center justify-center p-8">
                  <RecruitTree recruits={profile.recruits} agentId={profile.agentId} />
                </div>
              </div>
            </div>

            <div className="col-span-4 space-y-6">
              <div className="bg-gradient-to-br from-cyan-900/40 to-transparent border border-cyan-600 p-6">
                <h3 className="text-cyan-400 text-xs tracking-[0.3em] mb-4">YOUR ACTIVATION CODE</h3>
                <div className="text-3xl font-bold text-cyan-300 text-center py-4 bg-black/60 border border-cyan-700 tracking-[0.15em] mb-4 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                  {profile.referralCode || "[ LOCKED ]"}
                </div>
                <div className="text-cyan-600 text-xs leading-relaxed">
                  Share this code with candidates. Command: <code className="text-cyan-400 bg-black/50 px-1">!activate {profile.referralCode}</code>
                </div>
              </div>

              <div className="bg-black/60 border border-cyan-800 p-6">
                <h3 className="text-cyan-500 text-xs tracking-[0.3em] mb-4">NETWORK METRICS</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-700 text-sm">Direct Nodes</span>
                    <span className="text-cyan-300 font-bold text-lg">{profile.stats.recruitsCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-700 text-sm">Active Nodes</span>
                    <span className="text-green-400 font-bold text-lg">
                      {profile.recruits.filter(r => r.active).length}
                    </span>
                  </div>
                  <div className="border-t border-cyan-900 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-700 text-sm">Network Credits</span>
                      <span className="text-cyan-400 font-bold">{profile.stats.totalPoints}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "terminal" && (
          <div className="h-[calc(100vh-220px)]">
            <LogosTerminal userId={profile.id} />
          </div>
        )}
      </main>

      <footer className="bg-black/95 border-t border-cyan-800 px-6 py-2 flex justify-between items-center relative z-40">
        <div className="flex items-center gap-6 text-[10px] text-cyan-700 tracking-widest">
          <span>OPERATIVE: {profile.agentId}</span>
          <span>•</span>
          <span>LAYER: {profile.layer}</span>
          <span>•</span>
          <span>SESSION: ACTIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1.5 h-3 bg-green-500/70 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <span className="text-[10px] text-green-400 tracking-widest">ENCRYPTED CHANNEL</span>
        </div>
      </footer>
    </div>
  );
}
