
"use client";

import React, { useState, useEffect, useRef } from "react";

// --- Types ---
type Agent = {
  id: string;
  handle: string;
  role: string;
  lastActive: string;
  missionsRun: number;
  traits: Record<string, any>;
};

type Mission = {
  id: string;
  title: string;
  type: string;
};

type Log = {
  id: string;
  agent: string;
  hypothesis: string;
  status: string;
};

type DashboardData = {
  stats: {
    totalAgents: number;
    activeMissions: number;
    completedMissions: number;
  };
  agents: Agent[];
  missions: Mission[];
  experiments: Log[];
};

// --- Styles ---
const COLORS = {
  bg: "#090812",
  primary: "#2fb7c3",
  secondary: "#1e9fb3",
  dim: "rgba(47, 183, 195, 0.3)",
  highlight: "#ffffff",
  error: "#ff0000",
  warning: "#ffff00",
};

const BORDER_STYLE = `1px solid ${COLORS.dim}`;
const GLOW_TEXT = `0 0 5px ${COLORS.dim}`;

// --- Components ---

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col p-4 border border-[color:var(--dim)] bg-[color:var(--bg-dim)]" style={{ borderColor: COLORS.dim, backgroundColor: 'rgba(47,183,195,0.05)' }}>
    <span className="text-xs uppercase tracking-wider opacity-70" style={{ color: COLORS.secondary }}>{label}</span>
    <span className="text-2xl font-bold mt-1" style={{ color: COLORS.primary, textShadow: GLOW_TEXT }}>{value}</span>
  </div>
);

const TabButton = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 text-sm uppercase tracking-widest transition-all duration-200 border-r border-b border-[color:var(--dim)]`}
    style={{
      borderColor: COLORS.dim,
      color: active ? COLORS.bg : COLORS.primary,
      backgroundColor: active ? COLORS.primary : "transparent",
      fontWeight: active ? "bold" : "normal",
    }}
  >
    {label}
  </button>
);

const AgentRow = ({ agent, onInspect }: { agent: Agent; onInspect: (h: string) => void }) => (
  <tr className="border-b border-[color:var(--dim)] hover:bg-[color:var(--bg-dim)] transition-colors" style={{ borderColor: COLORS.dim }}>
    <td className="p-3 text-sm" style={{ color: COLORS.highlight }}>{agent.handle}</td>
    <td className="p-3 text-sm opacity-80" style={{ color: COLORS.primary }}>{agent.role}</td>
    <td className="p-3 text-sm text-right font-mono" style={{ color: COLORS.secondary }}>{agent.missionsRun}</td>
    <td className="p-3 text-right">
      <button
        onClick={() => onInspect(agent.handle)}
        className="text-xs px-2 py-1 border hover:bg-[color:var(--primary)] hover:text-black transition-colors"
        style={{ borderColor: COLORS.primary, color: COLORS.primary }}
      >
        INSPECT
      </button>
    </td>
  </tr>
);

const ChatInterface = ({ selectedHandle }: { selectedHandle?: string | null }) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Array<{ role: "user" | "ai"; content: string }>>([
    { role: "ai", content: "ARCHITECT ONLINE. Awaiting query." }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setHistory(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            handle: selectedHandle || "General", 
            query: userMsg 
        }),
      });
      
      if (!res.ok) throw new Error("Connection failed");
      
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let aiResponse = "";
      
      // Add placeholder for streaming
      setHistory(prev => [...prev, { role: "ai", content: "" }]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        aiResponse += chunk;
        
        // Update last message
        setHistory(prev => {
            const newHist = [...prev];
            newHist[newHist.length - 1].content = aiResponse;
            return newHist;
        });
      }
    } catch (err) {
      setHistory(prev => [...prev, { role: "ai", content: "ERROR: LINK SEVERED." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full border-l" style={{ borderColor: COLORS.dim }}>
      <div className="p-4 border-b" style={{ borderColor: COLORS.dim }}>
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: COLORS.warning }}>
            ARCHITECT LINK
        </h3>
        <div className="text-xs opacity-60 mt-1" style={{ color: COLORS.secondary }}>
            {selectedHandle ? `Subject: ${selectedHandle}` : "Channel: Global"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
        {history.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div 
                className={`max-w-[85%] p-3 text-sm border ${msg.role === "user" ? "border-r-2" : "border-l-2"}`}
                style={{ 
                    borderColor: msg.role === "user" ? COLORS.secondary : COLORS.primary,
                    backgroundColor: msg.role === "user" ? 'rgba(30,159,179,0.1)' : 'rgba(47,183,195,0.05)',
                    color: COLORS.highlight
                }}
            >
                {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-black/40" style={{ borderColor: COLORS.dim }}>
        <div className="flex gap-2">
            <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={loading ? "PROCESSING..." : "Query the Architect..."}
                disabled={loading}
                className="flex-1 bg-transparent border p-2 text-sm focus:outline-none focus:ring-1 transition-all font-mono"
                style={{ 
                    borderColor: COLORS.dim, 
                    color: COLORS.primary,
                    boxShadow: loading ? 'none' : `inset 0 0 10px rgba(0,0,0,0.5)`
                }}
            />
            <button 
                type="submit"
                disabled={loading}
                className="px-4 border text-sm hover:bg-[color:var(--primary)] hover:text-black transition-colors disabled:opacity-50"
                style={{ borderColor: COLORS.primary, color: COLORS.primary }}
            >
                SEND
            </button>
        </div>
      </form>
    </div>
  );
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"agents" | "missions">("agents");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => setLoading(false));
  }, []);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black font-mono" style={{ color: COLORS.primary }}>
            <div className="animate-pulse">ESTABLISHING SECURE CONNECTION...</div>
        </div>
    );
  }

  if (!data) return <div>Error loading data.</div>;

  return (
    <div className="min-h-screen bg-black font-mono flex flex-col" style={{ color: COLORS.primary, backgroundColor: COLORS.bg }}>
      {/* Header */}
      <header className="border-b p-4 flex justify-between items-center" style={{ borderColor: COLORS.dim }}>
        <div>
            <h1 className="text-xl font-bold tracking-[0.2em]" style={{ textShadow: GLOW_TEXT }}>
                PROJECT 89 // OVERWATCH
            </h1>
            <div className="text-xs opacity-60 mt-1">Clearance: OMNI // System: STABLE</div>
        </div>
        <div className="flex gap-4">
            <StatCard label="AGENTS" value={data.stats.totalAgents} />
            <StatCard label="ACTIVE OPS" value={data.stats.activeMissions} />
            <StatCard label="COMPLETED" value={data.stats.completedMissions} />
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: COLORS.dim }}>
                <TabButton active={activeTab === "agents"} label="Operatives" onClick={() => setActiveTab("agents")} />
                <TabButton active={activeTab === "missions"} label="Missions" onClick={() => setActiveTab("missions")} />
            </div>

            {/* Viewport */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "agents" && (
                    <div className="space-y-6">
                        <div className="border" style={{ borderColor: COLORS.dim }}>
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[color:var(--bg-dim)]" style={{ backgroundColor: 'rgba(47,183,195,0.1)' }}>
                                    <tr>
                                        <th className="p-3 text-xs uppercase opacity-70 border-b" style={{ borderColor: COLORS.dim }}>Handle</th>
                                        <th className="p-3 text-xs uppercase opacity-70 border-b" style={{ borderColor: COLORS.dim }}>Role</th>
                                        <th className="p-3 text-xs uppercase opacity-70 text-right border-b" style={{ borderColor: COLORS.dim }}>Ops</th>
                                        <th className="p-3 border-b" style={{ borderColor: COLORS.dim }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.agents.map(agent => (
                                        <AgentRow 
                                            key={agent.id} 
                                            agent={agent} 
                                            onInspect={(h) => setSelectedAgent(h)} 
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "missions" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.missions.map(m => (
                            <div key={m.id} className="border p-4 hover:bg-white/5 transition-colors" style={{ borderColor: COLORS.dim }}>
                                <div className="text-xs uppercase opacity-50 mb-2 border-b pb-1" style={{ borderColor: COLORS.dim }}>{m.type}</div>
                                <div className="font-bold text-lg mb-2" style={{ color: COLORS.highlight }}>{m.title}</div>
                                <div className="text-xs opacity-70 font-mono">{m.id}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Right Sidebar: Architect Chat */}
        <div className="w-[400px] flex-shrink-0 bg-black/20 backdrop-blur-sm z-10">
            <ChatInterface selectedHandle={selectedAgent} />
        </div>
      </div>
    </div>
  );
}
