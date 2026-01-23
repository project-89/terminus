"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { LogosPanel, LogosButton } from "./components/LogosPanel";

const Globe = dynamic(() => import("./components/Globe"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-cyan-400 animate-pulse font-mono tracking-widest">ESTABLISHING UPLINK...</div>
    </div>
  ),
});

const ADMIN_AUTH_KEY = "p89_admin_auth";
const ADMIN_SECRET_KEY = "p89_admin_secret";

// Helper to get stored admin secret for API calls
export function getAdminSecret(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_SECRET_KEY);
}

// Helper for authenticated admin fetch
export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const secret = getAdminSecret();
  const headers = new Headers(options.headers);
  if (secret) {
    headers.set("x-admin-secret", secret);
  }
  return fetch(url, { ...options, headers });
}

function AccessGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError("");
    
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem(ADMIN_AUTH_KEY, btoa(code + ":" + Date.now()));
        // Store the secret for API calls (returned from auth endpoint)
        if (data.secret) {
          localStorage.setItem(ADMIN_SECRET_KEY, data.secret);
        }
        onAuthenticated();
      } else {
        setError("ACCESS DENIED - REDIRECTING TO TERMINAL...");
        setCode("");
        setRedirecting(true);
        setTimeout(() => router.push("/"), 1500);
      }
    } catch {
      setError("CONNECTION FAILED");
    }
    setChecking(false);
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center font-mono">
      <div className="w-full max-w-md p-8">
        <div className="border-2 border-red-800 bg-black/80 p-8">
          <div className="text-center mb-8">
            <div className="text-red-500 text-xs tracking-[0.5em] mb-2">RESTRICTED ACCESS</div>
            <div className="text-cyan-400 text-2xl tracking-[0.3em]">PROJECT 89</div>
            <div className="text-cyan-700 text-xs mt-2">DIRECTOR CONSOLE</div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-cyan-600 text-xs tracking-widest mb-2">ENTER ACCESS CODE</label>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={redirecting}
                className="w-full bg-black border-2 border-cyan-800 p-3 text-cyan-300 text-center tracking-[0.5em] focus:border-cyan-500 focus:outline-none font-mono text-lg disabled:opacity-50"
                placeholder="••••••••"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-center text-sm mb-4 animate-pulse">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={checking || !code || redirecting}
              className="w-full bg-cyan-900/30 border-2 border-cyan-600 p-3 text-cyan-400 tracking-widest hover:bg-cyan-900/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? "AUTHENTICATING..." : "AUTHENTICATE"}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <div className="text-red-900 text-xs">UNAUTHORIZED ACCESS WILL BE LOGGED</div>
            <button 
              onClick={() => router.push("/")}
              className="mt-4 text-cyan-700 text-xs hover:text-cyan-500 transition"
            >
              ← RETURN TO TERMINAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type Tab = "overview" | "agents" | "missions" | "fieldops" | "campaigns" | "experiments" | "dreams" | "knowledge" | "artifacts" | "rewards" | "sessions";

type Agent = {
  id: string;
  handle: string;
  role: string;
  trustScore: number;
  layer: number;
  stats: { totalSessions: number; totalMinutes: number; daysSinceFirst: number; daysSinceLast: number | null; returnRate: number };
  missions: { total: number; completed: number; avgScore: number };
  fieldMissions: { total: number; completed: number; active: any };
  experiments: { total: number; recent: any[] };
  dreams: { total: number; recent: any[] };
  createdAt: string;
};

type Stats = {
  agents: { total: number; active24h: number; activeWeek: number; byLayer: Record<number, number> };
  sessions: { total: number; today: number; thisWeek: number; byHour: Record<number, number> };
  missions: { total: number; completed: number; active: number };
  fieldMissions: { total: number; completed: number };
  experiments: { total: number };
  dreams: { total: number; topSymbols: Array<{ symbol: string; count: number }> };
  synchronicities: { total: number };
  knowledge: { totalNodes: number };
};

const LAYER_COLORS = ["#555", "#0af", "#0fa", "#fa0", "#f55", "#f0f"];

const DEFAULT_STATS: Stats = {
  agents: { total: 0, active24h: 0, activeWeek: 0, byLayer: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
  sessions: { total: 0, today: 0, thisWeek: 0, byHour: Object.fromEntries([...Array(24)].map((_, i) => [i, 0])) },
  missions: { total: 0, completed: 0, active: 0 },
  fieldMissions: { total: 0, completed: 0 },
  experiments: { total: 0 },
  dreams: { total: 0, topSymbols: [] },
  synchronicities: { total: 0 },
  knowledge: { totalNodes: 0 },
};

export default function DashboardPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [fieldMissions, setFieldMissions] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [dreams, setDreams] = useState<any[]>([]);
  const [knowledge, setKnowledge] = useState<{ nodes: any[]; edges: any[]; stats: any }>({ nodes: [], edges: [], stats: null });
  const [artifacts, setArtifacts] = useState<{ artifacts: any[]; zoneStats: any[]; recentScans: any[]; topDeployers: any[]; stats: any }>({ artifacts: [], zoneStats: [], recentScans: [], topDeployers: [], stats: null });
  const [rewards, setRewards] = useState<{ configs: any[]; stats: any; topEarners: any[] }>({ configs: [], stats: null, topEarners: [] });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [uptime, setUptime] = useState(0);
  const [showLogos, setShowLogos] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_AUTH_KEY);
    if (stored) {
      try {
        const decoded = atob(stored);
        const timestamp = parseInt(decoded.split(":").pop() || "0");
        const hoursSinceAuth = (Date.now() - timestamp) / (1000 * 60 * 60);
        if (hoursSinceAuth < 24) {
          setAuthenticated(true);
          return;
        }
      } catch {}
    }
    setAuthenticated(false);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setUptime(u => u + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const safeFetch = async (url: string) => {
      try {
        const r = await adminFetch(url);
        if (!r.ok) {
          const errorData = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
          console.error(`[Admin Dashboard] ${url} failed:`, errorData.error || r.status);
          return { _error: errorData.error || `HTTP ${r.status}` };
        }
        return await r.json();
      } catch (e) {
        console.error(`[Admin Dashboard] ${url} fetch failed:`, e);
        return { _error: "Network error" };
      }
    };
    Promise.all([
      safeFetch("/api/admin/stats"),
      safeFetch("/api/admin/agents"),
      safeFetch("/api/admin/missions"),
      safeFetch("/api/admin/fieldops"),
      safeFetch("/api/admin/experiments"),
      safeFetch("/api/admin/dreams"),
      safeFetch("/api/admin/knowledge"),
      safeFetch("/api/admin/artifacts"),
      safeFetch("/api/admin/rewards"),
      safeFetch("/api/admin/campaigns"),
    ]).then(([statsData, agentsData, missionsData, fieldOpsData, experimentsData, dreamsData, knowledgeData, artifactsData, rewardsData, campaignsData]) => {
      // Check for auth errors - if any critical endpoint failed with auth error, show it
      const authError = [statsData, agentsData].find(d => d?._error?.includes("Unauthorized") || d?._error?.includes("not configured"));
      if (authError) {
        console.error("[Admin Dashboard] Auth error detected, clearing session");
        localStorage.removeItem(ADMIN_AUTH_KEY);
        localStorage.removeItem(ADMIN_SECRET_KEY);
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      if (statsData && !statsData.error && !statsData._error) setStats(statsData);
      setAgents(agentsData?.agents || []);
      setMissions(missionsData?.missions || []);
      setFieldMissions(fieldOpsData?.fieldMissions || []);
      setExperiments(experimentsData?.experiments || []);
      setDreams(dreamsData?.dreams || []);
      if (knowledgeData && !knowledgeData._error) setKnowledge(knowledgeData);
      if (artifactsData && !artifactsData._error) setArtifacts(artifactsData);
      if (rewardsData && !rewardsData._error) setRewards(rewardsData);
      setCampaigns(campaignsData?.campaigns || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [authenticated]);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  if (authenticated === null) {
    return (
      <div className="h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-cyan-600 animate-pulse">INITIALIZING...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <AccessGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="text-cyan-400 text-2xl tracking-[0.5em] mb-4">PROJECT 89</div>
          <div className="text-cyan-600 animate-pulse">ESTABLISHING SECURE UPLINK...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black font-mono text-cyan-400 flex overflow-hidden select-none">
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === "overview" && stats ? (
          <OverviewLayout 
            stats={stats} 
            agents={agents} 
            time={time} 
            uptime={formatUptime(uptime)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        ) : (
          <>
            <Header time={time} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 flex overflow-hidden">
              {activeTab === "agents" && <AgentsPanel agents={agents} />}
              {activeTab === "missions" && <MissionsPanel missions={missions} setMissions={setMissions} />}
              {activeTab === "fieldops" && <FieldOpsPanel fieldMissions={fieldMissions} setFieldMissions={setFieldMissions} />}
              {activeTab === "experiments" && <ExperimentsPanel experiments={experiments} />}
              {activeTab === "dreams" && <DreamsPanel dreams={dreams} />}
              {activeTab === "knowledge" && <KnowledgePanel knowledge={knowledge} />}
              {activeTab === "artifacts" && <ArtifactsPanel data={artifacts} />}
              {activeTab === "rewards" && <RewardsPanel data={rewards} setData={setRewards} />}
              {activeTab === "sessions" && <SessionsPanel agents={agents} />}
              {activeTab === "campaigns" && <CampaignsPanel campaigns={campaigns} setCampaigns={setCampaigns} />}
            </div>
          </>
        )}
      </div>
      
      {showLogos && <LogosPanel onClose={() => setShowLogos(false)} />}
      {!showLogos && <LogosButton onClick={() => setShowLogos(true)} />}
    </div>
  );
}

function Header({ time, activeTab, setActiveTab }: { time: Date; activeTab: Tab; setActiveTab: (t: Tab) => void }) {
  const tabs: Tab[] = ["overview", "agents", "missions", "fieldops", "campaigns", "experiments", "dreams", "knowledge", "artifacts", "rewards", "sessions"];
  return (
    <header className="border-b border-cyan-900/50 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-8">
        <div className="text-cyan-400 text-2xl font-bold tracking-[0.2em]">PROJECT 89</div>
        <nav className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm tracking-widest uppercase ${activeTab === tab ? "bg-cyan-400/20 text-cyan-300 border border-cyan-500" : "text-cyan-600 hover:text-cyan-400 border border-transparent"}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="text-3xl text-cyan-300 tracking-wider">{time.toLocaleTimeString('en-US', { hour12: false })}</div>
    </header>
  );
}

function OverviewLayout({ stats, agents, time, uptime, activeTab, setActiveTab }: any) {
  const router = useRouter();
  const tabs: Tab[] = ["overview", "agents", "missions", "fieldops", "campaigns", "experiments", "dreams", "knowledge", "artifacts", "rewards", "sessions"];
  const goToDossier = (id: string) => router.push(`/dashboard/agent/${id}`);
  
  return (
    <div className="h-full flex flex-col">
      <header className="border-b-2 border-cyan-700/50 px-6 py-3 flex justify-between items-center bg-gradient-to-r from-black via-cyan-950/20 to-black">
        <div className="flex items-center gap-8">
          <div className="shrink-0">
            <div className="text-cyan-400 text-2xl font-bold tracking-widest whitespace-nowrap">PROJECT 89</div>
            <div className="text-cyan-600 text-xs tracking-widest">OVERWATCH COMMAND</div>
          </div>
          <div className="h-12 w-px bg-cyan-800" />
          <nav className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm tracking-widest uppercase transition-all ${activeTab === tab ? "bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500" : "text-cyan-700 hover:text-cyan-400 border-2 border-transparent hover:border-cyan-800"}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-4xl text-cyan-300 tracking-wider font-light">{time.toLocaleTimeString('en-US', { hour12: false })}</div>
            <div className="text-cyan-600 tracking-widest">{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
            <div>
              <div className="text-green-400 text-lg tracking-widest">ONLINE</div>
              <div className="text-green-600 text-xs">UPLINK STABLE</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[55%] relative border-r-2 border-cyan-900/30">
          <Globe agents={agents} onAgentClick={(a: any) => goToDossier(a.id)} showLegend={false} />
          
          <div className="absolute top-4 left-4">
            <div className="text-cyan-400 text-lg tracking-widest border-b-2 border-cyan-500/50 pb-1 mb-2">GLOBAL NETWORK</div>
            <div className="text-cyan-400 text-2xl font-bold">{agents.length} <span className="text-lg font-normal text-cyan-600">OPERATIVES</span></div>
            <div className="text-cyan-600 mt-1">{stats.agents.active24h} active / {stats.agents.activeWeek} this week</div>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="text-cyan-700 text-sm tracking-widest mb-2">NETWORK ACTIVITY (24H)</div>
            <div className="flex gap-0.5 h-12 items-end bg-cyan-950/30 p-1 border border-cyan-900/50">
              {Object.entries(stats.sessions.byHour).map(([hour, count]) => {
                const max = Math.max(...Object.values(stats.sessions.byHour) as number[], 1);
                const h = ((count as number) / max) * 100;
                return (
                  <div key={hour} className="flex-1 flex flex-col justify-end">
                    <div className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400" style={{ height: `${Math.max(h, 5)}%` }} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-cyan-800 mt-1">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 text-right">
            <div className="text-cyan-800 text-xs tracking-widest">SESSION UPTIME</div>
            <div className="text-cyan-400 text-3xl font-mono tracking-wider">{uptime}</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="grid grid-cols-3 gap-4 p-4 border-b-2 border-cyan-900/30">
            <StatBox label="TOTAL AGENTS" value={stats.agents.total} sub={`${stats.agents.active24h} online`} color="cyan" />
            <StatBox label="MISSIONS ACTIVE" value={stats.missions.active} sub={`${stats.missions.completed} completed`} color="yellow" />
            <StatBox label="FIELD OPS" value={stats.fieldMissions.total} sub={`${stats.fieldMissions.completed} success`} color="green" />
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="w-1/3 border-r border-cyan-900/30 p-4 overflow-auto">
              <div className="text-cyan-400 tracking-widest border-b-2 border-cyan-500/30 pb-2 mb-3">OPERATIVE ROSTER</div>
              <div className="space-y-1">
                {agents.slice(0, 12).map((agent: Agent) => (
                  <div
                    key={agent.id}
                    onClick={() => goToDossier(agent.id)}
                    className="flex items-center gap-3 p-2 hover:bg-cyan-500/10 cursor-pointer border border-transparent hover:border-cyan-700 transition-all"
                  >
                    <div className="w-3 h-3 border-2" style={{ borderColor: LAYER_COLORS[agent.layer], backgroundColor: agent.stats.daysSinceLast === 0 ? LAYER_COLORS[agent.layer] : 'transparent' }} />
                    <div className="flex-1">
                      <div className="text-cyan-300">{agent.handle}</div>
                      <div className="text-xs text-cyan-700">L{agent.layer} • {(agent.trustScore * 100).toFixed(0)}% trust</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-cyan-500">{agent.stats.totalSessions} sessions</div>
                      <div className="text-cyan-700">{agent.stats.totalMinutes}m total</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-1/3 border-r border-cyan-900/30 p-4 overflow-auto">
              <ActivityFeed />
            </div>

            <div className="w-1/3 p-4 overflow-auto space-y-4">
              <div>
                <div className="text-cyan-400 tracking-widest border-b-2 border-cyan-500/30 pb-2 mb-3">CLEARANCE LEVELS</div>
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4, 5].map(layer => {
                    const count = stats.agents.byLayer[layer] || 0;
                    const pct = stats.agents.total > 0 ? (count / stats.agents.total) * 100 : 0;
                    const labels = ["UNVERIFIED", "INITIATE", "AGENT", "OPERATIVE", "HANDLER", "ARCHITECT"];
                    return (
                      <div key={layer} className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center border-2 text-lg font-bold" style={{ borderColor: LAYER_COLORS[layer], color: LAYER_COLORS[layer] }}>
                          {layer}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-cyan-500">{labels[layer]}</span>
                            <span style={{ color: LAYER_COLORS[layer] }}>{count}</span>
                          </div>
                          <div className="h-2 bg-cyan-950 rounded overflow-hidden">
                            <div className="h-full rounded transition-all" style={{ width: `${pct}%`, backgroundColor: LAYER_COLORS[layer] }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-cyan-400 tracking-widest border-b-2 border-cyan-500/30 pb-2 mb-3">INTELLIGENCE</div>
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat label="Knowledge Nodes" value={stats.knowledge.totalNodes} />
                  <MiniStat label="Dream Reports" value={stats.dreams.total} />
                  <MiniStat label="Synchronicities" value={stats.synchronicities.total} />
                  <MiniStat label="Experiments" value={stats.experiments.total} />
                </div>
              </div>

              {stats.dreams.topSymbols.length > 0 && (
                <div>
                  <div className="text-cyan-400 tracking-widest border-b-2 border-cyan-500/30 pb-2 mb-3">DREAM PATTERNS</div>
                  <div className="flex flex-wrap gap-2">
                    {stats.dreams.topSymbols.slice(0, 8).map(({ symbol }: any) => (
                      <span key={symbol} className="px-3 py-1 border border-cyan-700 text-cyan-400 text-sm">
                        {symbol}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatBox({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  const colors: Record<string, string> = {
    cyan: "border-cyan-500 text-cyan-300",
    yellow: "border-yellow-500 text-yellow-300",
    green: "border-green-500 text-green-300",
  };
  return (
    <div className={`border-2 ${colors[color]} p-4 bg-gradient-to-br from-black to-cyan-950/20`}>
      <div className="text-xs text-cyan-600 tracking-widest mb-1">{label}</div>
      <div className="text-4xl font-bold">{value}</div>
      <div className="text-sm text-cyan-600 mt-1">{sub}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-cyan-800 p-3 bg-cyan-950/20">
      <div className="text-2xl font-bold text-cyan-300">{value}</div>
      <div className="text-xs text-cyan-600">{label}</div>
    </div>
  );
}

function ActivityFeed() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await adminFetch("/api/admin/activity?limit=30");
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchActivity();
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const EVENT_ICONS: Record<string, string> = {
    SESSION_START: ">>",
    MESSAGE: ">",
    MISSION_COMPLETE: "[OK]",
    MISSION_FAILED: "[X]",
    MISSION_UPDATE: "[~]",
    FIELD_MISSION_SUBMITTED: "[!]",
    FIELD_MISSION_COMPLETE: "[OK]",
    FIELD_MISSION_UPDATE: "[~]",
    EXPERIMENT_CREATED: "[?]",
    DREAM_RECORDED: "[*]",
  };

  const EVENT_COLORS: Record<string, string> = {
    SESSION_START: "text-cyan-400",
    MESSAGE: "text-cyan-600",
    MISSION_COMPLETE: "text-green-400",
    MISSION_FAILED: "text-red-400",
    MISSION_UPDATE: "text-yellow-400",
    FIELD_MISSION_SUBMITTED: "text-purple-400",
    FIELD_MISSION_COMPLETE: "text-green-400",
    FIELD_MISSION_UPDATE: "text-cyan-400",
    EXPERIMENT_CREATED: "text-yellow-400",
    DREAM_RECORDED: "text-purple-400",
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getEventText = (event: any) => {
    const name = event.agent.codename || event.agent.handle || "Unknown";
    switch (event.type) {
      case "SESSION_START": return `${name} connected`;
      case "MESSAGE": return `${name}: ${event.data.content?.slice(0, 40) || "..."}`;
      case "MISSION_COMPLETE": return `${name} completed ${event.data.title}`;
      case "MISSION_FAILED": return `${name} failed ${event.data.title}`;
      case "FIELD_MISSION_SUBMITTED": return `${name} submitted ${event.data.title}`;
      case "FIELD_MISSION_COMPLETE": return `${name} field op approved`;
      case "EXPERIMENT_CREATED": return `LOGOS testing: ${event.data.hypothesis?.slice(0, 30)}`;
      case "DREAM_RECORDED": return `${name} dream: ${event.data.symbols?.join(", ") || "recorded"}`;
      default: return `${name} activity`;
    }
  };

  if (loading) {
    return (
      <div className="text-cyan-400 tracking-widest border-b-2 border-cyan-500/30 pb-2 mb-3">
        ACTIVITY FEED
        <div className="text-cyan-700 text-sm mt-2 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="text-cyan-400 tracking-widest border-b-2 border-cyan-500/30 pb-2 mb-3 flex justify-between items-center">
        <span>ACTIVITY FEED</span>
        <span className="text-xs text-cyan-700">{events.length} events</span>
      </div>
      <div className="space-y-1">
        {events.slice(0, 20).map((event) => (
          <div
            key={event.id}
            onClick={() => router.push(`/dashboard/agent/${event.agent.id}`)}
            className="flex items-start gap-2 py-1 hover:bg-cyan-500/10 cursor-pointer px-1 -mx-1 transition-colors"
          >
            <span className={`font-mono text-xs ${EVENT_COLORS[event.type] || "text-cyan-600"}`}>
              {EVENT_ICONS[event.type] || ">"}
            </span>
            <div className="flex-1 min-w-0">
              <div className={`text-xs truncate ${EVENT_COLORS[event.type] || "text-cyan-500"}`}>
                {getEventText(event)}
              </div>
              <div className="text-xs text-cyan-800">{formatTime(event.timestamp)}</div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-cyan-700 text-sm text-center py-4">No recent activity</div>
        )}
      </div>
    </>
  );
}

function AgentsPanel({ agents }: { agents: Agent[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const filtered = agents.filter(a => a.handle?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 p-6 overflow-auto">
      <input
        type="text"
        placeholder="SEARCH OPERATIVES..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-lg bg-transparent border-2 border-cyan-800 px-4 py-3 text-lg text-cyan-300 placeholder-cyan-700 focus:outline-none focus:border-cyan-500 mb-6"
      />
      
      <div className="border-2 border-cyan-900">
        <div className="grid grid-cols-7 gap-4 p-3 bg-cyan-950/50 text-sm text-cyan-500 tracking-widest border-b-2 border-cyan-900">
          <div>HANDLE</div>
          <div className="text-center">LAYER</div>
          <div className="text-center">TRUST</div>
          <div className="text-center">SESSIONS</div>
          <div className="text-center">TIME</div>
          <div className="text-center">MISSIONS</div>
          <div className="text-center">LAST SEEN</div>
        </div>
        {filtered.map(agent => (
          <div 
            key={agent.id}
            onClick={() => router.push(`/dashboard/agent/${agent.id}`)}
            className="grid grid-cols-7 gap-4 p-3 border-t border-cyan-900/50 hover:bg-cyan-500/10 cursor-pointer"
          >
            <div className="text-cyan-300 text-lg">{agent.handle}</div>
            <div className="text-center">
              <span className="px-2 py-1 text-sm font-bold" style={{ backgroundColor: LAYER_COLORS[agent.layer], color: "#000" }}>
                L{agent.layer}
              </span>
            </div>
            <div className="text-center text-cyan-400 text-lg">{(agent.trustScore * 100).toFixed(0)}%</div>
            <div className="text-center text-cyan-500">{agent.stats.totalSessions}</div>
            <div className="text-center text-cyan-500">{agent.stats.totalMinutes}m</div>
            <div className="text-center text-cyan-500">{agent.missions.completed}/{agent.missions.total}</div>
            <div className="text-center text-cyan-600">{agent.stats.daysSinceLast !== null ? `${agent.stats.daysSinceLast}d ago` : "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MissionsPanel({ missions, setMissions }: { missions: any[]; setMissions: (m: any[]) => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", prompt: "", type: "decode", tags: "", minEvidence: 1 });
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedMission, setSelectedMission] = useState<any>(null);

  const resetForm = () => {
    setForm({ title: "", prompt: "", type: "decode", tags: "", minEvidence: 1 });
    setEditingId(null);
    setShowCreate(false);
  };

  const handleCreate = async () => {
    const payload = {
      action: editingId ? "update" : "create",
      id: editingId,
      title: form.title,
      prompt: form.prompt,
      type: form.type,
      minEvidence: form.minEvidence,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    };
    const res = await adminFetch("/api/admin/missions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = await res.json();
      if (editingId) {
        setMissions(missions.map(m => m.id === editingId ? { ...m, ...updated } : m));
      } else {
        setMissions([updated, ...missions]);
      }
      resetForm();
    }
  };

  const handleToggle = async (id: string) => {
    const res = await adminFetch("/api/admin/missions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", id }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMissions(missions.map(m => m.id === id ? { ...m, active: updated.active } : m));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this mission directive?")) return;
    const res = await adminFetch("/api/admin/missions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) {
      setMissions(missions.filter(m => m.id !== id));
      if (selectedMission?.id === id) setSelectedMission(null);
    }
  };

  const startEdit = (m: any) => {
    setForm({
      title: m.title,
      prompt: m.prompt,
      type: m.type || "decode",
      tags: (m.tags || []).join(", "),
      minEvidence: m.minEvidence || 1,
    });
    setEditingId(m.id);
    setShowCreate(true);
  };

  const filtered = missions.filter(m => 
    filter === "all" ? true : filter === "active" ? m.active : !m.active
  );

  const totalRuns = missions.reduce((acc, m) => acc + (m.stats?.totalRuns || 0), 0);
  const totalCompleted = missions.reduce((acc, m) => acc + (m.stats?.completedRuns || 0), 0);
  const activeMissions = missions.filter(m => m.active).length;

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-2/3 border-r-2 border-cyan-900 flex flex-col">
        <div className="p-4 border-b-2 border-cyan-900 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-cyan-400 text-xl tracking-widest">MISSION DIRECTIVES</div>
            <div className="flex gap-1">
              {(["all", "active", "inactive"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs tracking-widest ${filter === f ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500" : "text-cyan-700 border border-cyan-900 hover:border-cyan-700"}`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => { resetForm(); setShowCreate(!showCreate); }} 
            className="px-4 py-2 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
          >
            + NEW DIRECTIVE
          </button>
        </div>

        {showCreate && (
          <div className="border-b-2 border-cyan-500 p-4 bg-cyan-950/30">
            <div className="text-cyan-500 text-sm tracking-widest mb-3">{editingId ? "EDIT DIRECTIVE" : "NEW DIRECTIVE"}</div>
            <input 
              placeholder="Mission Title" 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              className="w-full bg-transparent border-2 border-cyan-800 p-3 text-cyan-300 mb-3 focus:border-cyan-500 focus:outline-none" 
            />
            <textarea 
              placeholder="Mission Briefing - describe the objective clearly..." 
              value={form.prompt} 
              onChange={e => setForm({...form, prompt: e.target.value})} 
              className="w-full bg-transparent border-2 border-cyan-800 p-3 text-cyan-300 h-24 mb-3 focus:border-cyan-500 focus:outline-none resize-none" 
            />
            <div className="flex gap-3 items-center">
              <select 
                value={form.type} 
                onChange={e => setForm({...form, type: e.target.value})} 
                className="bg-black border-2 border-cyan-800 p-3 text-cyan-300 focus:border-cyan-500 focus:outline-none"
              >
                <option value="decode">DECODE</option>
                <option value="observe">OBSERVE</option>
                <option value="photograph">PHOTOGRAPH</option>
                <option value="locate">LOCATE</option>
                <option value="document">DOCUMENT</option>
                <option value="infiltrate">INFILTRATE</option>
              </select>
              <div className="flex items-center gap-2">
                <span className="text-cyan-700 text-sm">MIN EVIDENCE:</span>
                <input 
                  type="number" 
                  min={1} 
                  max={10}
                  value={form.minEvidence} 
                  onChange={e => setForm({...form, minEvidence: parseInt(e.target.value) || 1})} 
                  className="w-16 bg-black border-2 border-cyan-800 p-3 text-cyan-300 focus:border-cyan-500 focus:outline-none" 
                />
              </div>
              <input 
                placeholder="Tags (comma separated)" 
                value={form.tags} 
                onChange={e => setForm({...form, tags: e.target.value})} 
                className="flex-1 bg-transparent border-2 border-cyan-800 p-3 text-cyan-300 focus:border-cyan-500 focus:outline-none" 
              />
              <button onClick={resetForm} className="px-4 py-3 border-2 border-cyan-800 text-cyan-600 hover:text-cyan-400">CANCEL</button>
              <button onClick={handleCreate} className="px-6 py-3 bg-cyan-500/30 border-2 border-cyan-500 text-cyan-300 hover:bg-cyan-500/40">
                {editingId ? "UPDATE" : "DEPLOY"}
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(m => (
              <div 
                key={m.id} 
                onClick={() => setSelectedMission(m)}
                className={`border-2 p-4 cursor-pointer transition-all ${
                  selectedMission?.id === m.id 
                    ? "border-cyan-500 bg-cyan-500/10" 
                    : m.active 
                      ? "border-cyan-900 hover:border-cyan-700" 
                      : "border-cyan-900/50 hover:border-cyan-800 opacity-60"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-cyan-600 text-xs tracking-widest">{m.type?.toUpperCase()}</span>
                  <span className={`px-2 py-0.5 text-xs ${m.active ? "bg-green-500/30 text-green-400 border border-green-500" : "bg-red-500/30 text-red-400 border border-red-500"}`}>
                    {m.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
                <div className="text-lg text-cyan-300 mb-2 line-clamp-1">{m.title}</div>
                <div className="text-cyan-700 text-sm line-clamp-2 mb-3">{m.prompt}</div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex gap-2">
                    {(m.tags || []).slice(0, 2).map((t: string) => (
                      <span key={t} className="px-2 py-0.5 border border-cyan-800 text-cyan-600">{t}</span>
                    ))}
                  </div>
                  <div className="text-cyan-600">
                    {m.stats?.completedRuns || 0}/{m.stats?.totalRuns || 0} runs
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-1/3 flex flex-col">
        <div className="p-4 border-b-2 border-cyan-900">
          <div className="text-cyan-400 tracking-widest mb-4">MISSION STATS</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-cyan-800 p-3 text-center">
              <div className="text-2xl font-bold text-cyan-300">{missions.length}</div>
              <div className="text-xs text-cyan-700">TOTAL</div>
            </div>
            <div className="border border-green-800 p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{activeMissions}</div>
              <div className="text-xs text-green-700">ACTIVE</div>
            </div>
            <div className="border border-cyan-800 p-3 text-center">
              <div className="text-2xl font-bold text-cyan-300">{totalRuns}</div>
              <div className="text-xs text-cyan-700">RUNS</div>
            </div>
          </div>
          {totalRuns > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-cyan-700 mb-1">
                <span>COMPLETION RATE</span>
                <span>{((totalCompleted / totalRuns) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-cyan-950 rounded overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${(totalCompleted / totalRuns) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {selectedMission ? (
          <div className="flex-1 overflow-auto p-4">
            <div className="text-cyan-500 text-xs tracking-widest mb-2">SELECTED DIRECTIVE</div>
            <div className="text-xl text-cyan-300 mb-1">{selectedMission.title}</div>
            <div className="flex gap-2 mb-4">
              <span className="text-cyan-600 text-sm">{selectedMission.type?.toUpperCase()}</span>
              <span className="text-cyan-700">•</span>
              <span className="text-cyan-600 text-sm">{selectedMission.minEvidence || 1} evidence required</span>
            </div>
            
            <div className="text-cyan-700 text-xs tracking-widest mb-2">BRIEFING</div>
            <div className="text-cyan-400 text-sm mb-4 whitespace-pre-wrap">{selectedMission.prompt}</div>

            {selectedMission.tags?.length > 0 && (
              <>
                <div className="text-cyan-700 text-xs tracking-widest mb-2">TAGS</div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedMission.tags.map((t: string) => (
                    <span key={t} className="px-2 py-1 border border-cyan-700 text-cyan-500 text-sm">{t}</span>
                  ))}
                </div>
              </>
            )}

            <div className="text-cyan-700 text-xs tracking-widest mb-2">STATISTICS</div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="border border-cyan-900 p-3">
                <div className="text-2xl font-bold text-cyan-300">{selectedMission.stats?.totalRuns || 0}</div>
                <div className="text-xs text-cyan-700">TOTAL RUNS</div>
              </div>
              <div className="border border-cyan-900 p-3">
                <div className="text-2xl font-bold text-green-400">{selectedMission.stats?.completedRuns || 0}</div>
                <div className="text-xs text-cyan-700">COMPLETED</div>
              </div>
              <div className="border border-cyan-900 p-3 col-span-2">
                <div className="text-2xl font-bold text-cyan-300">
                  {selectedMission.stats?.avgScore ? `${(selectedMission.stats.avgScore * 100).toFixed(0)}%` : "N/A"}
                </div>
                <div className="text-xs text-cyan-700">AVG SCORE</div>
              </div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => startEdit(selectedMission)}
                className="w-full py-2 border-2 border-cyan-600 text-cyan-400 hover:bg-cyan-600/20"
              >
                EDIT DIRECTIVE
              </button>
              <button 
                onClick={() => handleToggle(selectedMission.id)}
                className={`w-full py-2 border-2 ${selectedMission.active ? "border-yellow-600 text-yellow-400 hover:bg-yellow-600/20" : "border-green-600 text-green-400 hover:bg-green-600/20"}`}
              >
                {selectedMission.active ? "DEACTIVATE" : "ACTIVATE"}
              </button>
              <button 
                onClick={() => handleDelete(selectedMission.id)}
                className="w-full py-2 border-2 border-red-600 text-red-400 hover:bg-red-600/20"
              >
                DELETE DIRECTIVE
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-cyan-700">
            SELECT A MISSION TO VIEW DETAILS
          </div>
        )}
      </div>
    </div>
  );
}

function FieldOpsPanel({ fieldMissions, setFieldMissions }: { fieldMissions: any[]; setFieldMissions: (m: any[]) => void }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<any>(null);
  const [evalForm, setEvalForm] = useState({ evaluation: "", score: 0.7 });
  const [saving, setSaving] = useState(false);

  const STATUS_COLORS: Record<string, string> = {
    ASSIGNED: "border-cyan-600 text-cyan-400",
    ACCEPTED: "border-blue-600 text-blue-400",
    IN_PROGRESS: "border-yellow-600 text-yellow-400",
    EVIDENCE_SUBMITTED: "border-purple-600 text-purple-400 animate-pulse",
    UNDER_REVIEW: "border-orange-600 text-orange-400 animate-pulse",
    COMPLETED: "border-green-600 text-green-400",
    FAILED: "border-red-600 text-red-400",
    EXPIRED: "border-gray-600 text-gray-400",
  };

  // Statuses that count as "pending review" for admin attention
  const isReviewStatus = (status: string) =>
    status === "EVIDENCE_SUBMITTED" || status === "UNDER_REVIEW";

  const filtered = fieldMissions.filter(m =>
    filter === "all" ? true :
    filter === "review" ? isReviewStatus(m.status) :
    m.status === filter
  );

  const pendingCount = fieldMissions.filter(m => isReviewStatus(m.status)).length;

  const handleEvaluate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/fieldops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          id: selected.id,
          evaluation: evalForm.evaluation,
          score: evalForm.score,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setFieldMissions(fieldMissions.map(m => m.id === selected.id ? { ...m, ...updated } : m));
        setSelected({ ...selected, ...updated });
        setEvalForm({ evaluation: "", score: 0.7 });
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-2/3 border-r-2 border-cyan-900 flex flex-col">
        <div className="p-4 border-b-2 border-cyan-900 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-cyan-400 text-xl tracking-widest">FIELD OPERATIONS</div>
            {pendingCount > 0 && (
              <span className="px-3 py-1 bg-purple-500/30 border border-purple-500 text-purple-300 text-sm animate-pulse">
                {pendingCount} PENDING REVIEW
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {[
              { key: "all", label: "ALL" },
              { key: "review", label: "REVIEW" },
              { key: "IN_PROGRESS", label: "ACTIVE" },
              { key: "COMPLETED", label: "DONE" },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1 text-xs tracking-widest ${filter === f.key ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500" : "text-cyan-700 border border-cyan-900 hover:border-cyan-700"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {filtered.map(m => (
              <div
                key={m.id}
                onClick={() => setSelected(m)}
                className={`border-2 p-4 cursor-pointer transition-all ${
                  selected?.id === m.id 
                    ? "border-cyan-500 bg-cyan-500/10" 
                    : "border-cyan-900 hover:border-cyan-700"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-600 text-xs tracking-widest">{m.type}</span>
                    <span className={`px-2 py-0.5 text-xs border ${STATUS_COLORS[m.status]}`}>
                      {m.status.replace("_", " ")}
                    </span>
                  </div>
                  <span className="text-cyan-700 text-xs">{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-lg text-cyan-300 mb-1">{m.title}</div>
                <div className="flex justify-between items-center">
                  <div 
                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/agent/${m.agent.id}`); }}
                    className="text-cyan-600 text-sm hover:text-cyan-400 cursor-pointer"
                  >
                    {m.agent.codename || m.agent.handle}
                  </div>
                  <div className="flex items-center gap-2">
                    {m.evidence?.length > 0 && (
                      <span className="text-cyan-600 text-xs">{m.evidence.length} evidence</span>
                    )}
                    {m.score !== null && (
                      <span className={`text-sm font-bold ${m.score >= 0.6 ? "text-green-400" : "text-red-400"}`}>
                        {(m.score * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-cyan-700">NO FIELD OPERATIONS FOUND</div>
            )}
          </div>
        </div>
      </div>

      <div className="w-1/3 flex flex-col">
        {selected ? (
          <div className="flex-1 overflow-auto p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-cyan-500 text-xs tracking-widest mb-1">FIELD OPERATION</div>
                <div className="text-xl text-cyan-300">{selected.title}</div>
              </div>
              <span className={`px-2 py-1 text-xs border ${STATUS_COLORS[selected.status]}`}>
                {selected.status.replace("_", " ")}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-cyan-700 text-xs tracking-widest mb-1">OPERATIVE</div>
              <div 
                onClick={() => router.push(`/dashboard/agent/${selected.agent.id}`)}
                className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {selected.agent.codename || selected.agent.handle}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-cyan-700 text-xs tracking-widest mb-1">BRIEFING</div>
              <div className="text-cyan-400 text-sm whitespace-pre-wrap">{selected.briefing}</div>
            </div>

            {selected.objectives && (
              <div className="mb-4">
                <div className="text-cyan-700 text-xs tracking-widest mb-2">OBJECTIVES</div>
                <div className="space-y-1">
                  {(Array.isArray(selected.objectives) ? selected.objectives : [selected.objectives]).map((obj: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={obj.completed ? "text-green-400" : "text-cyan-600"}>
                        {obj.completed ? "[X]" : "[ ]"}
                      </span>
                      <span className="text-cyan-400">{obj.description || obj.title || JSON.stringify(obj)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.evidence?.length > 0 && (
              <div className="mb-4">
                <div className="text-cyan-700 text-xs tracking-widest mb-2">SUBMITTED EVIDENCE</div>
                <div className="space-y-2">
                  {selected.evidence.map((ev: any, i: number) => (
                    <div key={i} className="border border-cyan-800 p-3 bg-cyan-950/30">
                      <div className="flex justify-between text-xs text-cyan-600 mb-2">
                        <span>{ev.type?.toUpperCase() || "EVIDENCE"}</span>
                        <span>{ev.timestamp ? new Date(ev.timestamp).toLocaleString() : ""}</span>
                      </div>
                      {ev.type === "photo" && ev.url && (
                        <img src={ev.url} alt="Evidence" className="w-full h-40 object-cover mb-2 border border-cyan-700" />
                      )}
                      <div className="text-cyan-300 text-sm whitespace-pre-wrap">{ev.content || ev.description || JSON.stringify(ev)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.report && (
              <div className="mb-4">
                <div className="text-cyan-700 text-xs tracking-widest mb-1">AGENT REPORT</div>
                <div className="text-cyan-400 text-sm whitespace-pre-wrap border border-cyan-800 p-3">{selected.report}</div>
              </div>
            )}

            {selected.evaluation && (
              <div className="mb-4">
                <div className="text-cyan-700 text-xs tracking-widest mb-1">EVALUATION</div>
                <div className="text-cyan-400 text-sm whitespace-pre-wrap border border-green-800 p-3 bg-green-950/20">{selected.evaluation}</div>
                {selected.score !== null && (
                  <div className="mt-2 text-center">
                    <span className={`text-2xl font-bold ${selected.score >= 0.6 ? "text-green-400" : "text-red-400"}`}>
                      {(selected.score * 100).toFixed(0)}% SCORE
                    </span>
                  </div>
                )}
              </div>
            )}

            {isReviewStatus(selected.status) && (
              <div className="border-2 border-purple-600 p-4 bg-purple-950/20">
                <div className="text-purple-400 text-sm tracking-widest mb-3">EVALUATE SUBMISSION</div>
                <textarea
                  value={evalForm.evaluation}
                  onChange={(e) => setEvalForm({ ...evalForm, evaluation: e.target.value })}
                  placeholder="Provide evaluation feedback..."
                  className="w-full bg-black border border-purple-800 p-3 text-cyan-300 h-24 mb-3 focus:border-purple-500 focus:outline-none resize-none"
                />
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-cyan-700 text-sm">SCORE:</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={evalForm.score * 100}
                    onChange={(e) => setEvalForm({ ...evalForm, score: parseInt(e.target.value) / 100 })}
                    className="flex-1 accent-purple-500"
                  />
                  <span className={`text-lg font-bold ${evalForm.score >= 0.6 ? "text-green-400" : "text-red-400"}`}>
                    {(evalForm.score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs text-cyan-700 mb-3">
                  Score &gt;= 60% = COMPLETED, &lt; 60% = FAILED
                </div>
                <button
                  onClick={handleEvaluate}
                  disabled={saving || !evalForm.evaluation}
                  className="w-full py-2 border-2 border-purple-500 text-purple-300 hover:bg-purple-500/20 disabled:opacity-50"
                >
                  {saving ? "SUBMITTING..." : "SUBMIT EVALUATION"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-cyan-700">
            SELECT AN OPERATION TO REVIEW
          </div>
        )}
      </div>
    </div>
  );
}

function DreamsPanel({ dreams }: { dreams: any[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/dreams")
      .then(r => r.json())
      .then(data => setStats(data.stats))
      .catch(console.error);
  }, []);

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-2/3 border-r-2 border-cyan-900 flex flex-col">
        <div className="p-4 border-b-2 border-cyan-900">
          <div className="text-cyan-400 text-xl tracking-widest mb-4">COLLECTIVE DREAM ANALYSIS</div>
          
          {stats?.topSymbols && (
            <div className="mb-4">
              <div className="text-cyan-600 text-xs tracking-widest mb-2">RECURRING SYMBOLS</div>
              <div className="flex flex-wrap gap-2">
                {stats.topSymbols.slice(0, 12).map((s: any) => (
                  <div 
                    key={s.symbol}
                    className="px-3 py-2 border border-purple-700 bg-purple-950/30 hover:bg-purple-900/40 cursor-pointer transition"
                    title={`Connections: ${s.connections?.join(", ") || "none"}`}
                  >
                    <div className="text-purple-300">{s.symbol}</div>
                    <div className="text-purple-600 text-xs">{s.count} occurrences</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats?.topEmotions && (
            <div>
              <div className="text-cyan-600 text-xs tracking-widest mb-2">EMOTIONAL THEMES</div>
              <div className="flex flex-wrap gap-2">
                {stats.topEmotions.map((e: any) => (
                  <span key={e.emotion} className="px-3 py-1 border border-cyan-700 text-cyan-400 text-sm">
                    {e.emotion} ({e.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="text-cyan-600 text-xs tracking-widest mb-3">DREAM ENTRIES ({dreams.length})</div>
          <div className="space-y-2">
            {dreams.map(dream => (
              <div
                key={dream.id}
                onClick={() => setSelected(dream)}
                className={`border-2 p-4 cursor-pointer transition-all ${
                  selected?.id === dream.id 
                    ? "border-purple-500 bg-purple-500/10" 
                    : "border-cyan-900 hover:border-cyan-700"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div 
                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/agent/${dream.agent.id}`); }}
                    className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    {dream.agent.codename || dream.agent.handle}
                  </div>
                  <div className="flex items-center gap-2">
                    {dream.recurrence > 1 && (
                      <span className="px-2 py-0.5 text-xs border border-yellow-600 text-yellow-400">
                        RECURRING x{dream.recurrence}
                      </span>
                    )}
                    <span className="text-cyan-700 text-xs">{new Date(dream.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-cyan-300 text-sm line-clamp-2 mb-2">{dream.content}</div>
                <div className="flex flex-wrap gap-1">
                  {dream.symbols.slice(0, 5).map((s: string) => (
                    <span key={s} className="px-2 py-0.5 text-xs bg-purple-900/30 border border-purple-800 text-purple-400">{s}</span>
                  ))}
                  {dream.symbols.length > 5 && (
                    <span className="px-2 py-0.5 text-xs text-purple-600">+{dream.symbols.length - 5}</span>
                  )}
                </div>
              </div>
            ))}
            {dreams.length === 0 && (
              <div className="text-center py-12 text-cyan-700">NO DREAM ENTRIES RECORDED</div>
            )}
          </div>
        </div>
      </div>

      <div className="w-1/3 flex flex-col">
        <div className="p-4 border-b-2 border-cyan-900">
          <div className="text-cyan-400 tracking-widest mb-4">DREAM STATS</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-cyan-800 p-3 text-center">
              <div className="text-2xl font-bold text-cyan-300">{stats?.total || dreams.length}</div>
              <div className="text-xs text-cyan-700">ENTRIES</div>
            </div>
            <div className="border border-purple-800 p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats?.uniqueSymbols || 0}</div>
              <div className="text-xs text-purple-700">SYMBOLS</div>
            </div>
            <div className="border border-yellow-800 p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats?.recurringCount || 0}</div>
              <div className="text-xs text-yellow-700">RECURRING</div>
            </div>
            <div className="border border-cyan-800 p-3 text-center">
              <div className="text-2xl font-bold text-cyan-300">{((stats?.avgLucidity || 0) * 100).toFixed(0)}%</div>
              <div className="text-xs text-cyan-700">AVG LUCIDITY</div>
            </div>
          </div>
        </div>

        {selected ? (
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-4">
              <div className="text-purple-500 text-xs tracking-widest mb-1">DREAM ENTRY</div>
              <div 
                onClick={() => router.push(`/dashboard/agent/${selected.agent.id}`)}
                className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {selected.agent.codename || selected.agent.handle}
              </div>
              <div className="text-cyan-700 text-xs">{new Date(selected.createdAt).toLocaleString()}</div>
            </div>

            <div className="mb-4">
              <div className="text-cyan-700 text-xs tracking-widest mb-1">CONTENT</div>
              <div className="text-cyan-400 text-sm whitespace-pre-wrap border border-purple-800 p-3 bg-purple-950/20 max-h-48 overflow-auto">
                {selected.content}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-cyan-700 text-xs tracking-widest mb-1">SYMBOLS</div>
              <div className="flex flex-wrap gap-1">
                {selected.symbols.map((s: string) => (
                  <span key={s} className="px-2 py-1 text-sm bg-purple-900/30 border border-purple-700 text-purple-300">{s}</span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-cyan-700 text-xs tracking-widest mb-1">EMOTIONS</div>
              <div className="flex flex-wrap gap-1">
                {selected.emotions.map((e: string) => (
                  <span key={e} className="px-2 py-1 text-sm border border-cyan-700 text-cyan-400">{e}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="border border-cyan-800 p-2 text-center">
                <div className="text-lg font-bold text-cyan-300">{((selected.lucidity || 0) * 100).toFixed(0)}%</div>
                <div className="text-xs text-cyan-700">LUCIDITY</div>
              </div>
              <div className="border border-cyan-800 p-2 text-center">
                <div className="text-lg font-bold text-cyan-300">{selected.recurrence || 1}</div>
                <div className="text-xs text-cyan-700">RECURRENCE</div>
              </div>
            </div>

            {selected.analysis && (
              <div>
                <div className="text-cyan-700 text-xs tracking-widest mb-1">ANALYSIS</div>
                <div className="text-cyan-400 text-sm whitespace-pre-wrap border border-cyan-800 p-3">
                  {selected.analysis}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-cyan-700">
            SELECT A DREAM TO VIEW DETAILS
          </div>
        )}
      </div>
    </div>
  );
}

function ExperimentsPanel({ experiments }: { experiments: any[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = experiments.filter(e => 
    filter === "all" ? true :
    filter === "pass" ? e.latestResult === "pass" :
    filter === "fail" ? e.latestResult === "fail" :
    filter === "active" ? !e.latestResult :
    true
  );

  const stats = {
    total: experiments.length,
    pass: experiments.filter(e => e.latestResult === "pass").length,
    fail: experiments.filter(e => e.latestResult === "fail").length,
    active: experiments.filter(e => !e.latestResult).length,
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-2/3 border-r-2 border-cyan-900 flex flex-col">
        <div className="p-4 border-b-2 border-cyan-900 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-cyan-400 text-xl tracking-widest">LOGOS EXPERIMENTS</div>
            <div className="text-cyan-700 text-sm">Behavioral analysis protocols</div>
          </div>
          <div className="flex gap-1">
            {[
              { key: "all", label: "ALL" },
              { key: "active", label: "ACTIVE" },
              { key: "pass", label: "PASS" },
              { key: "fail", label: "FAIL" },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1 text-xs tracking-widest ${filter === f.key ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500" : "text-cyan-700 border border-cyan-900 hover:border-cyan-700"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {filtered.map(exp => (
              <div
                key={exp.id}
                onClick={() => setSelected(exp)}
                className={`border-2 p-4 cursor-pointer transition-all ${
                  selected?.id === exp.id 
                    ? "border-cyan-500 bg-cyan-500/10" 
                    : "border-cyan-900 hover:border-cyan-700"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-xs border ${
                      exp.latestResult === "pass" ? "border-green-600 text-green-400" :
                      exp.latestResult === "fail" ? "border-red-600 text-red-400" :
                      "border-yellow-600 text-yellow-400"
                    }`}>
                      {exp.latestResult?.toUpperCase() || "ACTIVE"}
                    </span>
                    {exp.latestScore !== null && (
                      <span className="text-cyan-600 text-xs">{(exp.latestScore * 100).toFixed(0)}%</span>
                    )}
                  </div>
                  <span className="text-cyan-700 text-xs">{new Date(exp.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-lg text-cyan-300 mb-1">{exp.title || exp.hypothesis.slice(0, 50)}</div>
                <div className="text-cyan-600 text-sm mb-2 line-clamp-2">{exp.hypothesis}</div>
                <div className="flex justify-between items-center">
                  <div 
                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/agent/${exp.agent.id}`); }}
                    className="text-cyan-600 text-sm hover:text-cyan-400 cursor-pointer"
                  >
                    Subject: {exp.agent.codename || exp.agent.handle}
                  </div>
                  <span className="text-cyan-700 text-xs">{exp.events.length} observations</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-cyan-700">NO EXPERIMENTS FOUND</div>
            )}
          </div>
        </div>
      </div>

      <div className="w-1/3 flex flex-col">
        <div className="p-4 border-b-2 border-cyan-900">
          <div className="text-cyan-400 tracking-widest mb-4">EXPERIMENT STATS</div>
          <div className="grid grid-cols-4 gap-2">
            <div className="border border-cyan-800 p-2 text-center">
              <div className="text-xl font-bold text-cyan-300">{stats.total}</div>
              <div className="text-xs text-cyan-700">TOTAL</div>
            </div>
            <div className="border border-yellow-800 p-2 text-center">
              <div className="text-xl font-bold text-yellow-400">{stats.active}</div>
              <div className="text-xs text-yellow-700">ACTIVE</div>
            </div>
            <div className="border border-green-800 p-2 text-center">
              <div className="text-xl font-bold text-green-400">{stats.pass}</div>
              <div className="text-xs text-green-700">PASS</div>
            </div>
            <div className="border border-red-800 p-2 text-center">
              <div className="text-xl font-bold text-red-400">{stats.fail}</div>
              <div className="text-xs text-red-700">FAIL</div>
            </div>
          </div>
        </div>

        {selected ? (
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-4">
              <div className="text-cyan-500 text-xs tracking-widest mb-1">EXPERIMENT</div>
              <div className="text-xl text-cyan-300">{selected.title || "Untitled"}</div>
            </div>

            <div className="mb-4">
              <div className="text-cyan-700 text-xs tracking-widest mb-1">HYPOTHESIS</div>
              <div className="text-cyan-400 text-sm whitespace-pre-wrap border border-cyan-800 p-3 bg-cyan-950/30">
                {selected.hypothesis}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-cyan-700 text-xs tracking-widest mb-1">TASK</div>
              <div className="text-cyan-400 text-sm">{selected.task}</div>
            </div>

            {selected.successCriteria && (
              <div className="mb-4">
                <div className="text-cyan-700 text-xs tracking-widest mb-1">SUCCESS CRITERIA</div>
                <div className="text-cyan-400 text-sm">{selected.successCriteria}</div>
              </div>
            )}

            <div className="mb-4">
              <div className="text-cyan-700 text-xs tracking-widest mb-1">SUBJECT</div>
              <div 
                onClick={() => router.push(`/dashboard/agent/${selected.agent.id}`)}
                className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {selected.agent.codename || selected.agent.handle}
              </div>
            </div>

            <div>
              <div className="text-cyan-700 text-xs tracking-widest mb-2">OBSERVATIONS ({selected.events.length})</div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {selected.events.map((event: any, i: number) => (
                  <div key={event.id || i} className={`border p-3 ${
                    event.result === "pass" ? "border-green-800 bg-green-950/20" :
                    event.result === "fail" ? "border-red-800 bg-red-950/20" :
                    "border-cyan-800 bg-cyan-950/20"
                  }`}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className={
                        event.result === "pass" ? "text-green-400" :
                        event.result === "fail" ? "text-red-400" :
                        "text-cyan-600"
                      }>
                        {event.result?.toUpperCase() || "OBSERVATION"}
                      </span>
                      <span className="text-cyan-700">{new Date(event.createdAt).toLocaleString()}</span>
                    </div>
                    {event.observation && (
                      <div className="text-cyan-400 text-sm">{event.observation}</div>
                    )}
                    {event.score !== null && (
                      <div className="text-cyan-500 text-sm mt-1">Score: {(event.score * 100).toFixed(0)}%</div>
                    )}
                  </div>
                ))}
                {selected.events.length === 0 && (
                  <div className="text-cyan-700 text-sm text-center py-4">No observations recorded</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-cyan-700">
            SELECT AN EXPERIMENT TO VIEW DETAILS
          </div>
        )}
      </div>
    </div>
  );
}

function KnowledgePanel({ knowledge }: { knowledge: { nodes: any[]; edges: any[]; stats: any } }) {
  const router = useRouter();
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const NODE_COLORS: Record<string, { border: string; text: string; bg: string }> = {
    PUZZLE: { border: "border-yellow-600", text: "text-yellow-400", bg: "bg-yellow-950/30" },
    CLUE: { border: "border-cyan-600", text: "text-cyan-400", bg: "bg-cyan-950/30" },
    SOLUTION: { border: "border-green-600", text: "text-green-400", bg: "bg-green-950/30" },
    DISCOVERY: { border: "border-purple-600", text: "text-purple-400", bg: "bg-purple-950/30" },
    SECRET: { border: "border-red-600", text: "text-red-400", bg: "bg-red-950/30" },
    LOCATION: { border: "border-blue-600", text: "text-blue-400", bg: "bg-blue-950/30" },
    SYMBOL: { border: "border-pink-600", text: "text-pink-400", bg: "bg-pink-950/30" },
    DREAM: { border: "border-indigo-600", text: "text-indigo-400", bg: "bg-indigo-950/30" },
    SYNCHRONICITY: { border: "border-amber-600", text: "text-amber-400", bg: "bg-amber-950/30" },
    MISSION: { border: "border-teal-600", text: "text-teal-400", bg: "bg-teal-950/30" },
    ARTIFACT: { border: "border-orange-600", text: "text-orange-400", bg: "bg-orange-950/30" },
  };

  const getNodeConnections = (nodeId: string) => {
    const outgoing = knowledge.edges.filter(e => e.from === nodeId);
    const incoming = knowledge.edges.filter(e => e.to === nodeId);
    return { outgoing, incoming };
  };

  const filtered = knowledge.nodes.filter(n => {
    if (search && !n.label.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "all") return true;
    if (filter === "solved") return n.solved;
    if (filter === "unsolved") return !n.solved;
    return n.type === filter;
  });

  const stats = knowledge.stats || { totalNodes: 0, totalEdges: 0, byType: {}, solvedCount: { solved: 0, unsolved: 0 } };
  const nodeTypes = Object.keys(stats.byType || {});

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-2/3 border-r-2 border-cyan-900 flex flex-col">
        <div className="p-4 border-b-2 border-cyan-900">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="text-cyan-400 text-xl tracking-widest">KNOWLEDGE GRAPH</div>
              <div className="text-cyan-700 text-sm">{stats.totalNodes} nodes / {stats.totalEdges} edges</div>
            </div>
            <input
              type="text"
              placeholder="Search nodes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64 bg-transparent border-2 border-cyan-800 px-3 py-1 text-cyan-300 placeholder-cyan-700 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              { key: "all", label: "ALL" },
              { key: "solved", label: "SOLVED" },
              { key: "unsolved", label: "UNSOLVED" },
              ...nodeTypes.map(t => ({ key: t, label: t })),
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-2 py-1 text-xs tracking-widest ${filter === f.key ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500" : "text-cyan-700 border border-cyan-900 hover:border-cyan-700"}`}
              >
                {f.label} {f.key !== "all" && f.key !== "solved" && f.key !== "unsolved" && stats.byType?.[f.key] ? `(${stats.byType[f.key]})` : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-3 gap-3">
            {filtered.map(node => {
              const colors = NODE_COLORS[node.type] || NODE_COLORS.CLUE;
              const connections = getNodeConnections(node.id);
              return (
                <div
                  key={node.id}
                  onClick={() => setSelected(node)}
                  className={`border-2 p-3 cursor-pointer transition-all ${
                    selected?.id === node.id 
                      ? "border-cyan-500 bg-cyan-500/10" 
                      : `${colors.border} hover:bg-cyan-900/20`
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 text-xs border ${colors.border} ${colors.text}`}>
                      {node.type}
                    </span>
                    {node.solved && (
                      <span className="px-2 py-0.5 text-xs border border-green-600 text-green-400">SOLVED</span>
                    )}
                  </div>
                  <div className={`text-lg ${colors.text} mb-1 line-clamp-2`}>{node.label}</div>
                  <div className="flex justify-between items-center text-xs">
                    <span 
                      onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/agent/${node.agent.id}`); }}
                      className="text-cyan-600 hover:text-cyan-400 cursor-pointer"
                    >
                      {node.agent.codename || node.agent.handle}
                    </span>
                    <span className="text-cyan-700">
                      {connections.outgoing.length + connections.incoming.length} links
                    </span>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-12 text-cyan-700">NO KNOWLEDGE NODES FOUND</div>
            )}
          </div>
        </div>
      </div>

      <div className="w-1/3 flex flex-col">
        <div className="p-4 border-b-2 border-cyan-900">
          <div className="text-cyan-400 tracking-widest mb-4">GRAPH STATS</div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="border border-cyan-800 p-3 text-center">
              <div className="text-2xl font-bold text-cyan-300">{stats.totalNodes}</div>
              <div className="text-xs text-cyan-700">NODES</div>
            </div>
            <div className="border border-cyan-800 p-3 text-center">
              <div className="text-2xl font-bold text-cyan-300">{stats.totalEdges}</div>
              <div className="text-xs text-cyan-700">EDGES</div>
            </div>
            <div className="border border-green-800 p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.solvedCount?.solved || 0}</div>
              <div className="text-xs text-green-700">SOLVED</div>
            </div>
            <div className="border border-yellow-800 p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.solvedCount?.unsolved || 0}</div>
              <div className="text-xs text-yellow-700">UNSOLVED</div>
            </div>
          </div>

          {stats.topAgents && stats.topAgents.length > 0 && (
            <div>
              <div className="text-cyan-600 text-xs tracking-widest mb-2">TOP CONTRIBUTORS</div>
              <div className="space-y-1">
                {stats.topAgents.slice(0, 5).map((a: any) => (
                  <div 
                    key={a.id}
                    onClick={() => router.push(`/dashboard/agent/${a.id}`)}
                    className="flex justify-between text-sm cursor-pointer hover:bg-cyan-900/20 px-2 py-1"
                  >
                    <span className="text-cyan-400">{a.codename || a.handle}</span>
                    <span className="text-cyan-600">{a.nodeCount} nodes</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {selected ? (
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-4">
              <div className={`${NODE_COLORS[selected.type]?.text || "text-cyan-500"} text-xs tracking-widest mb-1`}>{selected.type}</div>
              <div className="text-xl text-cyan-300">{selected.label}</div>
              {selected.solved && (
                <div className="text-green-400 text-sm mt-1">SOLVED {selected.solvedAt ? `on ${new Date(selected.solvedAt).toLocaleDateString()}` : ""}</div>
              )}
            </div>

            <div className="mb-4">
              <div className="text-cyan-700 text-xs tracking-widest mb-1">DISCOVERED BY</div>
              <div 
                onClick={() => router.push(`/dashboard/agent/${selected.agent.id}`)}
                className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {selected.agent.codename || selected.agent.handle}
              </div>
              {selected.discoveredAt && (
                <div className="text-cyan-700 text-xs">{new Date(selected.discoveredAt).toLocaleString()}</div>
              )}
            </div>

            {selected.data && (
              <div className="mb-4">
                <div className="text-cyan-700 text-xs tracking-widest mb-1">DATA</div>
                <div className="text-cyan-400 text-sm whitespace-pre-wrap border border-cyan-800 p-3 bg-cyan-950/20 max-h-32 overflow-auto">
                  {typeof selected.data === "string" ? selected.data : JSON.stringify(selected.data, null, 2)}
                </div>
              </div>
            )}

            {(() => {
              const connections = getNodeConnections(selected.id);
              return (
                <>
                  {connections.outgoing.length > 0 && (
                    <div className="mb-4">
                      <div className="text-cyan-700 text-xs tracking-widest mb-2">OUTGOING CONNECTIONS ({connections.outgoing.length})</div>
                      <div className="space-y-1">
                        {connections.outgoing.map((edge: any) => (
                          <div 
                            key={edge.id} 
                            onClick={() => {
                              const target = knowledge.nodes.find(n => n.id === edge.to);
                              if (target) setSelected(target);
                            }}
                            className="flex items-center gap-2 text-sm border border-cyan-900 p-2 hover:bg-cyan-900/20 cursor-pointer"
                          >
                            <span className="text-cyan-600 font-mono">→</span>
                            <span className="text-purple-400 text-xs">{edge.relation}</span>
                            <span className="text-cyan-300 flex-1 truncate">{edge.toLabel}</span>
                            <span className={`text-xs ${NODE_COLORS[edge.toType]?.text || "text-cyan-600"}`}>{edge.toType}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {connections.incoming.length > 0 && (
                    <div className="mb-4">
                      <div className="text-cyan-700 text-xs tracking-widest mb-2">INCOMING CONNECTIONS ({connections.incoming.length})</div>
                      <div className="space-y-1">
                        {connections.incoming.map((edge: any) => (
                          <div 
                            key={edge.id}
                            onClick={() => {
                              const source = knowledge.nodes.find(n => n.id === edge.from);
                              if (source) setSelected(source);
                            }}
                            className="flex items-center gap-2 text-sm border border-cyan-900 p-2 hover:bg-cyan-900/20 cursor-pointer"
                          >
                            <span className="text-cyan-600 font-mono">←</span>
                            <span className="text-purple-400 text-xs">{edge.relation}</span>
                            <span className="text-cyan-300 flex-1 truncate">{edge.fromLabel}</span>
                            <span className={`text-xs ${NODE_COLORS[edge.fromType]?.text || "text-cyan-600"}`}>{edge.fromType}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {connections.outgoing.length === 0 && connections.incoming.length === 0 && (
                    <div className="text-cyan-700 text-sm text-center py-4">No connections</div>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-cyan-700">
            SELECT A NODE TO VIEW DETAILS
          </div>
        )}
      </div>
    </div>
  );
}

function ArtifactsPanel({ data }: { data: { artifacts: any[]; zoneStats: any[]; recentScans: any[]; topDeployers: any[]; stats: any } }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const TYPE_COLORS: Record<string, { border: string; text: string; bg: string }> = {
    STICKER: { border: "border-cyan-600", text: "text-cyan-400", bg: "bg-cyan-950/30" },
    DEADDROP: { border: "border-purple-600", text: "text-purple-400", bg: "bg-purple-950/30" },
    POSTER: { border: "border-yellow-600", text: "text-yellow-400", bg: "bg-yellow-950/30" },
    GRAFFITI: { border: "border-pink-600", text: "text-pink-400", bg: "bg-pink-950/30" },
    DIGITAL: { border: "border-blue-600", text: "text-blue-400", bg: "bg-blue-950/30" },
    CARD: { border: "border-green-600", text: "text-green-400", bg: "bg-green-950/30" },
    ZONE: { border: "border-orange-600", text: "text-orange-400", bg: "bg-orange-950/30" },
    BEACON: { border: "border-red-600", text: "text-red-400", bg: "bg-red-950/30" },
    AUDIO: { border: "border-indigo-600", text: "text-indigo-400", bg: "bg-indigo-950/30" },
  };

  const stats = data.stats || { totalArtifacts: 0, deployedArtifacts: 0, verifiedArtifacts: 0, totalScans: 0, totalRecruits: 0, activeZones: 0, byType: {} };

  const filtered = data.artifacts.filter(a => {
    if (search && !a.code.toLowerCase().includes(search.toLowerCase()) && !a.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "all") return true;
    if (filter === "deployed") return a.deployed;
    if (filter === "verified") return a.verified;
    if (filter === "undeployed") return !a.deployed;
    return a.type === filter;
  });

  const handleVerify = async (artifactId: string, verified: boolean) => {
    await adminFetch("/api/admin/artifacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", artifactId, verified }),
    });
    window.location.reload();
  };

  const handleDeactivate = async (artifactId: string) => {
    if (!confirm("Deactivate this artifact?")) return;
    await adminFetch("/api/admin/artifacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deactivate", artifactId }),
    });
    window.location.reload();
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b-2 border-cyan-900">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="text-cyan-400 text-xl tracking-widest">ARTIFACT NETWORK</div>
              <div className="text-cyan-700 text-sm">{stats.totalArtifacts} artifacts / {stats.totalScans} scans / {stats.totalRecruits} recruits</div>
            </div>
            <input
              type="text"
              placeholder="Search artifacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64 bg-transparent border-2 border-cyan-800 px-3 py-1 text-cyan-300 placeholder-cyan-700 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              { key: "all", label: "ALL" },
              { key: "deployed", label: "DEPLOYED" },
              { key: "verified", label: "VERIFIED" },
              { key: "undeployed", label: "UNDEPLOYED" },
              ...Object.keys(stats.byType || {}).map(t => ({ key: t, label: t })),
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-2 py-1 text-xs tracking-widest ${filter === f.key ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500" : "text-cyan-700 border border-cyan-900 hover:border-cyan-700"}`}
              >
                {f.label} {stats.byType?.[f.key] ? `(${stats.byType[f.key]})` : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(artifact => {
              const colors = TYPE_COLORS[artifact.type] || TYPE_COLORS.STICKER;
              return (
                <div key={artifact.id} className={`border-2 p-4 ${colors.border} ${colors.bg}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className={`${colors.text} text-xs tracking-widest mb-1`}>{artifact.type}</div>
                      <div className="text-cyan-300 text-lg font-mono">{artifact.code}</div>
                      {artifact.name && <div className="text-cyan-500 text-sm">{artifact.name}</div>}
                    </div>
                    <div className="flex gap-2">
                      {artifact.deployed && <span className="text-green-500 text-xs">DEPLOYED</span>}
                      {artifact.verified && <span className="text-yellow-500 text-xs">VERIFIED</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="border border-cyan-900 p-2">
                      <div className="text-cyan-300 text-lg">{artifact.scanCount}</div>
                      <div className="text-cyan-700 text-xs">SCANS</div>
                    </div>
                    <div className="border border-cyan-900 p-2">
                      <div className="text-cyan-300 text-lg">{artifact.recruitsGenerated}</div>
                      <div className="text-cyan-700 text-xs">RECRUITS</div>
                    </div>
                    <div className="border border-cyan-900 p-2">
                      <div className="text-cyan-300 text-lg">{artifact.pointsEarned}</div>
                      <div className="text-cyan-700 text-xs">POINTS</div>
                    </div>
                  </div>

                  <div className="text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-cyan-700">AGENT:</span>
                      <span 
                        onClick={() => router.push(`/dashboard/agent/${artifact.agent.id}`)}
                        className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                      >
                        {artifact.agent.codename || artifact.agent.handle}
                      </span>
                    </div>
                    {artifact.zone && (
                      <div className="flex justify-between">
                        <span className="text-cyan-700">ZONE:</span>
                        <span className="text-cyan-400">{artifact.zone}</span>
                      </div>
                    )}
                    {artifact.locationName && (
                      <div className="flex justify-between">
                        <span className="text-cyan-700">LOCATION:</span>
                        <span className="text-cyan-400 truncate ml-2">{artifact.locationName}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify(artifact.id, !artifact.verified)}
                      className={`flex-1 py-1 text-xs tracking-widest border ${artifact.verified ? "border-yellow-600 text-yellow-500 hover:bg-yellow-950/30" : "border-cyan-700 text-cyan-600 hover:bg-cyan-950/30"}`}
                    >
                      {artifact.verified ? "UNVERIFY" : "VERIFY"}
                    </button>
                    {artifact.active && (
                      <button
                        onClick={() => handleDeactivate(artifact.id)}
                        className="flex-1 py-1 text-xs tracking-widest border border-red-800 text-red-600 hover:bg-red-950/30"
                      >
                        DEACTIVATE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-80 border-l-2 border-cyan-900 flex flex-col">
        <div className="p-4 border-b border-cyan-900">
          <div className="text-cyan-400 tracking-widest mb-4">STATS</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-cyan-900 p-3 text-center">
              <div className="text-2xl text-cyan-300">{stats.totalArtifacts}</div>
              <div className="text-cyan-700 text-xs">TOTAL</div>
            </div>
            <div className="border border-cyan-900 p-3 text-center">
              <div className="text-2xl text-green-400">{stats.deployedArtifacts}</div>
              <div className="text-cyan-700 text-xs">DEPLOYED</div>
            </div>
            <div className="border border-cyan-900 p-3 text-center">
              <div className="text-2xl text-yellow-400">{stats.verifiedArtifacts}</div>
              <div className="text-cyan-700 text-xs">VERIFIED</div>
            </div>
            <div className="border border-cyan-900 p-3 text-center">
              <div className="text-2xl text-purple-400">{stats.activeZones}</div>
              <div className="text-cyan-700 text-xs">ZONES</div>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-cyan-900">
          <div className="text-cyan-400 tracking-widest mb-3">ZONE BREAKDOWN</div>
          <div className="space-y-2 max-h-40 overflow-auto">
            {data.zoneStats.map((z: any) => (
              <div key={z.zone} className="flex justify-between items-center text-sm border-b border-cyan-900/50 pb-1">
                <span className="text-cyan-400">{z.zone}</span>
                <div className="text-cyan-600">
                  <span className="text-cyan-300">{z.artifactCount}</span> / {z.totalScans} scans
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-cyan-900">
          <div className="text-cyan-400 tracking-widest mb-3">TOP DEPLOYERS</div>
          <div className="space-y-2 max-h-48 overflow-auto">
            {data.topDeployers.slice(0, 10).map((d: any) => (
              <div 
                key={d.id}
                onClick={() => router.push(`/dashboard/agent/${d.id}`)}
                className="flex justify-between items-center text-sm cursor-pointer hover:bg-cyan-900/20 px-2 py-1"
              >
                <span className="text-cyan-400">{d.codename || d.handle}</span>
                <div className="text-cyan-600">
                  <span className="text-green-400">{d.deployedCount}</span> / {d.totalScans} scans / <span className="text-yellow-400">{d.points}pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <div className="text-cyan-400 tracking-widest mb-3">RECENT SCANS</div>
          <div className="space-y-2">
            {data.recentScans.slice(0, 20).map((s: any) => (
              <div key={s.id} className="border border-cyan-900 p-2 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-cyan-300 font-mono">{s.artifactCode}</span>
                  <span className="text-cyan-700 text-xs">{new Date(s.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-cyan-600">{s.artifactType}</span>
                  {s.resultedInSignup && <span className="text-green-500">NEW RECRUIT</span>}
                </div>
                {s.scanner && (
                  <div className="text-cyan-500 text-xs mt-1">by {s.scanner.codename || s.scanner.handle}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RewardsPanel({ data, setData }: { data: { configs: any[]; stats: any; topEarners: any[] }; setData: (d: any) => void }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  const CATEGORY_ORDER = [
    { prefix: "DIRECT_REFERRAL", label: "Referral Rewards" },
    { prefix: "ARTIFACT_", label: "Artifact Rewards" },
    { prefix: "SESSION_", label: "Gameplay Rewards" },
    { prefix: "MISSION_", label: "Mission Rewards" },
    { prefix: "FIELD_", label: "Field Mission Rewards" },
    { prefix: "PUZZLE_", label: "Puzzle Rewards" },
    { prefix: "SECRET_", label: "Discovery Rewards" },
    { prefix: "DREAM_", label: "Dream Rewards" },
    { prefix: "SYNC_", label: "Synchronicity Rewards" },
    { prefix: "KNOWLEDGE_", label: "Knowledge Rewards" },
    { prefix: "LAYER_", label: "Progression Rewards" },
    { prefix: "DAILY_", label: "Daily Rewards" },
    { prefix: "STREAK_", label: "Streak Rewards" },
  ];

  const groupedConfigs = CATEGORY_ORDER.map(cat => ({
    label: cat.label,
    configs: data.configs.filter(c => c.taskType.startsWith(cat.prefix) || (cat.prefix === "DIRECT_REFERRAL" && c.taskType === "DIRECT_REFERRAL")),
  })).filter(g => g.configs.length > 0);

  const handleEdit = (config: any) => {
    setEditing(config.taskType);
    setEditValues({
      pointsAwarded: config.pointsAwarded,
      firstTimeBonus: config.firstTimeBonus,
      enabled: config.enabled,
      dailyLimit: config.dailyLimit || "",
      weeklyLimit: config.weeklyLimit || "",
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    await adminFetch("/api/admin/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", taskType: editing, updates: editValues }),
    });
    const res = await adminFetch("/api/admin/rewards");
    setData(await res.json());
    setEditing(null);
  };

  const handleToggle = async (taskType: string) => {
    await adminFetch("/api/admin/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", taskType }),
    });
    const res = await adminFetch("/api/admin/rewards");
    setData(await res.json());
  };

  const handleReset = async () => {
    if (!confirm("Reset all rewards to defaults?")) return;
    await adminFetch("/api/admin/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    const res = await adminFetch("/api/admin/rewards");
    setData(await res.json());
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b-2 border-cyan-900">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-cyan-400 text-xl tracking-widest">REWARD CONFIGURATION</div>
              <div className="text-cyan-700 text-sm">{data.configs.length} reward types</div>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-1 text-xs tracking-widest border border-red-800 text-red-600 hover:bg-red-950/30"
            >
              RESET TO DEFAULTS
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {groupedConfigs.map(group => (
            <div key={group.label} className="mb-6">
              <div className="text-cyan-500 tracking-widest text-sm mb-3 border-b border-cyan-900 pb-1">{group.label}</div>
              <div className="space-y-2">
                {group.configs.map(config => (
                  <div 
                    key={config.taskType}
                    className={`border p-3 ${config.enabled ? "border-cyan-800" : "border-cyan-900/50 opacity-50"}`}
                  >
                    {editing === config.taskType ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-cyan-400">{config.name}</span>
                          <div className="flex gap-2">
                            <button onClick={handleSave} className="px-3 py-1 text-xs bg-cyan-800 text-cyan-200 hover:bg-cyan-700">SAVE</button>
                            <button onClick={() => setEditing(null)} className="px-3 py-1 text-xs border border-cyan-800 text-cyan-600 hover:bg-cyan-900/30">CANCEL</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-cyan-700 text-xs block mb-1">POINTS</label>
                            <input
                              type="number"
                              value={editValues.pointsAwarded}
                              onChange={e => setEditValues({ ...editValues, pointsAwarded: parseInt(e.target.value) || 0 })}
                              className="w-full bg-transparent border border-cyan-800 px-2 py-1 text-cyan-300"
                            />
                          </div>
                          <div>
                            <label className="text-cyan-700 text-xs block mb-1">FIRST TIME BONUS</label>
                            <input
                              type="number"
                              value={editValues.firstTimeBonus}
                              onChange={e => setEditValues({ ...editValues, firstTimeBonus: parseInt(e.target.value) || 0 })}
                              className="w-full bg-transparent border border-cyan-800 px-2 py-1 text-cyan-300"
                            />
                          </div>
                          <div>
                            <label className="text-cyan-700 text-xs block mb-1">DAILY LIMIT</label>
                            <input
                              type="number"
                              value={editValues.dailyLimit}
                              onChange={e => setEditValues({ ...editValues, dailyLimit: e.target.value ? parseInt(e.target.value) : null })}
                              placeholder="No limit"
                              className="w-full bg-transparent border border-cyan-800 px-2 py-1 text-cyan-300 placeholder-cyan-800"
                            />
                          </div>
                          <div>
                            <label className="text-cyan-700 text-xs block mb-1">WEEKLY LIMIT</label>
                            <input
                              type="number"
                              value={editValues.weeklyLimit}
                              onChange={e => setEditValues({ ...editValues, weeklyLimit: e.target.value ? parseInt(e.target.value) : null })}
                              placeholder="No limit"
                              className="w-full bg-transparent border border-cyan-800 px-2 py-1 text-cyan-300 placeholder-cyan-800"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-cyan-400">{config.name}</div>
                          <div className="text-cyan-700 text-xs">{config.description}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-cyan-300 text-lg">{config.pointsAwarded}</div>
                            {config.firstTimeBonus > 0 && (
                              <div className="text-green-500 text-xs">+{config.firstTimeBonus} first</div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(config)}
                              className="px-2 py-1 text-xs border border-cyan-800 text-cyan-600 hover:bg-cyan-900/30"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => handleToggle(config.taskType)}
                              className={`px-2 py-1 text-xs border ${config.enabled ? "border-green-800 text-green-500" : "border-red-800 text-red-500"}`}
                            >
                              {config.enabled ? "ON" : "OFF"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-80 border-l-2 border-cyan-900 flex flex-col">
        <div className="p-4 border-b border-cyan-900">
          <div className="text-cyan-400 tracking-widest mb-4">STATS</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-cyan-900 p-3 text-center">
              <div className="text-2xl text-cyan-300">{data.stats?.totalPointsAwarded?.toLocaleString() || 0}</div>
              <div className="text-cyan-700 text-xs">TOTAL POINTS</div>
            </div>
            <div className="border border-cyan-900 p-3 text-center">
              <div className="text-2xl text-green-400">{data.stats?.usersWithPoints || 0}</div>
              <div className="text-cyan-700 text-xs">EARNERS</div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <div className="text-cyan-400 tracking-widest mb-3">TOP EARNERS</div>
          <div className="space-y-2">
            {data.topEarners.map((u: any, i: number) => (
              <div 
                key={u.id}
                onClick={() => router.push(`/dashboard/agent/${u.id}`)}
                className="flex justify-between items-center text-sm cursor-pointer hover:bg-cyan-900/20 px-2 py-2 border-b border-cyan-900/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-cyan-700 w-4">{i + 1}.</span>
                  <span className="text-cyan-400">{u.codename || u.handle}</span>
                </div>
                <span className="text-yellow-400">{u.points.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionsPanel({ agents }: { agents: Agent[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const sessions = agents.flatMap(a => (a as any).gameSessions?.map((s: any) => ({ ...s, agent: a.handle, agentId: a.id })) || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const loadSession = async (agentId: string, sessionId: string) => {
    const res = await adminFetch(`/api/admin/agents/${agentId}`);
    const agent = await res.json();
    setData(agent.gameSessions?.find((s: any) => s.id === sessionId));
    setSelected(sessionId);
  };

  return (
    <div className="flex-1 flex">
      <div className="w-80 border-r-2 border-cyan-900 overflow-auto p-4">
        <div className="text-cyan-400 tracking-widest mb-4">SESSION LOGS</div>
        {sessions.slice(0, 50).map((s: any) => (
          <div
            key={s.id}
            onClick={() => loadSession(s.agentId, s.id)}
            className={`p-3 mb-2 cursor-pointer border-2 ${selected === s.id ? "border-cyan-500 bg-cyan-500/10" : "border-cyan-900 hover:border-cyan-700"}`}
          >
            <div className="text-cyan-300 text-lg">{s.agent}</div>
            <div className="text-cyan-600">{new Date(s.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-6">
        {data ? (
          <div className="space-y-3">
            {data.messages?.map((m: any, i: number) => (
              <div key={i} className={`p-4 border-l-4 ${m.role === "user" ? "ml-20 border-yellow-500 bg-yellow-500/10" : "mr-20 border-cyan-500 bg-cyan-500/10"}`}>
                <div className="text-sm text-cyan-600 mb-2">{m.role.toUpperCase()}</div>
                <div className="text-cyan-300 whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-cyan-700 text-xl">SELECT A SESSION TO VIEW TRANSCRIPT</div>
        )}
      </div>
    </div>
  );
}

function CampaignsPanel({ campaigns, setCampaigns }: { campaigns: any[]; setCampaigns: (c: any[]) => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "active" | "draft" | "completed">("all");
  const [form, setForm] = useState({
    name: "",
    codename: "",
    description: "",
    narrative: "",
    minTrust: 0,
    maxAgents: 0,
    autoAssign: false,
  });
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setForm({
      name: "",
      codename: "",
      description: "",
      narrative: "",
      minTrust: 0,
      maxAgents: 0,
      autoAssign: false,
    });
    setShowCreate(false);
  };

  const handleCreate = async () => {
    setLoading(true);
    const res = await adminFetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const created = await res.json();
      setCampaigns([created, ...campaigns]);
      resetForm();
    }
    setLoading(false);
  };

  const handleActivate = async (id: string, action: "activate" | "pause" | "complete") => {
    const res = await adminFetch(`/api/admin/campaigns/${id}/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCampaigns(campaigns.map(c => c.id === id ? updated : c));
      if (selectedCampaign?.id === id) {
        setSelectedCampaign(updated);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    const res = await adminFetch(`/api/admin/campaigns/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setCampaigns(campaigns.filter(c => c.id !== id));
      if (selectedCampaign?.id === id) setSelectedCampaign(null);
    }
  };

  const loadCampaignDetail = async (id: string) => {
    const res = await adminFetch(`/api/admin/campaigns/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedCampaign(data);
    }
  };

  const filtered = campaigns.filter(c => {
    if (filter === "all") return true;
    if (filter === "active") return c.status === "ACTIVE";
    if (filter === "draft") return c.status === "DRAFT";
    if (filter === "completed") return c.status === "COMPLETED";
    return true;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "text-green-400 bg-green-900/30 border-green-600";
      case "DRAFT": return "text-yellow-400 bg-yellow-900/30 border-yellow-600";
      case "COMPLETED": return "text-cyan-400 bg-cyan-900/30 border-cyan-600";
      case "PAUSED": return "text-orange-400 bg-orange-900/30 border-orange-600";
      case "FAILED": return "text-red-400 bg-red-900/30 border-red-600";
      case "ARCHIVED": return "text-gray-400 bg-gray-900/30 border-gray-600";
      default: return "text-cyan-700 bg-cyan-900/30 border-cyan-800";
    }
  };

  const objectiveTypeColor = (type: string) => {
    switch (type) {
      case "COLLABORATIVE": return "text-purple-400";
      case "COMPETITIVE": return "text-red-400";
      case "SEQUENTIAL": return "text-orange-400";
      default: return "text-cyan-400";
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Campaign List */}
      <div className="w-1/3 border-r-2 border-cyan-900 flex flex-col">
        <div className="p-4 border-b-2 border-cyan-900">
          <div className="flex justify-between items-center mb-3">
            <div className="text-cyan-400 text-xl tracking-widest">CAMPAIGNS</div>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-3 py-1 text-sm tracking-widest bg-cyan-900/50 border border-cyan-600 text-cyan-400 hover:bg-cyan-800/50"
            >
              {showCreate ? "CANCEL" : "+ NEW"}
            </button>
          </div>
          <div className="flex gap-1 mb-3">
            {(["all", "active", "draft", "completed"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs tracking-widest ${filter === f ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500" : "text-cyan-700 border border-cyan-900 hover:border-cyan-700"}`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="text-cyan-600 text-xs">
            {filtered.length} CAMPAIGN{filtered.length !== 1 ? "S" : ""} | {campaigns.filter(c => c.status === "ACTIVE").length} ACTIVE
          </div>
        </div>

        {showCreate && (
          <div className="p-4 border-b-2 border-cyan-900 bg-cyan-950/30">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Campaign Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-black border border-cyan-800 p-2 text-cyan-300 text-sm focus:border-cyan-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Codename (optional)"
                value={form.codename}
                onChange={e => setForm({ ...form, codename: e.target.value })}
                className="w-full bg-black border border-cyan-800 p-2 text-cyan-300 text-sm focus:border-cyan-500 focus:outline-none"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full bg-black border border-cyan-800 p-2 text-cyan-300 text-sm focus:border-cyan-500 focus:outline-none resize-none"
              />
              <textarea
                placeholder="Narrative (shown to agents)"
                value={form.narrative}
                onChange={e => setForm({ ...form, narrative: e.target.value })}
                rows={2}
                className="w-full bg-black border border-cyan-800 p-2 text-cyan-300 text-sm focus:border-cyan-500 focus:outline-none resize-none"
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-cyan-600 text-xs mb-1">MIN TRUST</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={form.minTrust}
                    onChange={e => setForm({ ...form, minTrust: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-black border border-cyan-800 p-2 text-cyan-300 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-cyan-600 text-xs mb-1">MAX AGENTS</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxAgents}
                    onChange={e => setForm({ ...form, maxAgents: parseInt(e.target.value) || 0 })}
                    className="w-full bg-black border border-cyan-800 p-2 text-cyan-300 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-cyan-400 text-sm">
                <input
                  type="checkbox"
                  checked={form.autoAssign}
                  onChange={e => setForm({ ...form, autoAssign: e.target.checked })}
                  className="accent-cyan-500"
                />
                Auto-assign eligible agents
              </label>
              <button
                onClick={handleCreate}
                disabled={!form.name || !form.description || loading}
                className="w-full py-2 text-sm tracking-widest bg-cyan-800/50 border border-cyan-500 text-cyan-300 hover:bg-cyan-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "CREATING..." : "CREATE CAMPAIGN"}
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filtered.map(campaign => (
            <div
              key={campaign.id}
              onClick={() => loadCampaignDetail(campaign.id)}
              className={`p-4 border-b border-cyan-900/50 cursor-pointer hover:bg-cyan-950/30 transition ${selectedCampaign?.id === campaign.id ? "bg-cyan-900/20 border-l-4 border-l-cyan-500" : ""}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-cyan-300 font-semibold">{campaign.name}</div>
                  {campaign.codename && (
                    <div className="text-cyan-600 text-xs tracking-widest">{campaign.codename}</div>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs tracking-widest border ${statusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
              <div className="text-cyan-500 text-sm line-clamp-2">{campaign.description}</div>
              <div className="flex gap-4 mt-2 text-xs text-cyan-700">
                <span>{campaign._count?.phases || 0} phases</span>
                <span>{campaign._count?.participations || 0} agents</span>
                {campaign.deadline && (
                  <span>Due: {new Date(campaign.deadline).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-cyan-700">NO CAMPAIGNS FOUND</div>
          )}
        </div>
      </div>

      {/* Campaign Detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedCampaign ? (
          <>
            <div className="p-4 border-b-2 border-cyan-900">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-cyan-300 text-2xl tracking-widest">{selectedCampaign.name}</div>
                  {selectedCampaign.codename && (
                    <div className="text-cyan-600 tracking-[0.3em]">{selectedCampaign.codename}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedCampaign.status === "DRAFT" && (
                    <button
                      onClick={() => handleActivate(selectedCampaign.id, "activate")}
                      className="px-3 py-1 text-sm tracking-widest bg-green-900/50 border border-green-600 text-green-400 hover:bg-green-800/50"
                    >
                      ACTIVATE
                    </button>
                  )}
                  {selectedCampaign.status === "ACTIVE" && (
                    <>
                      <button
                        onClick={() => handleActivate(selectedCampaign.id, "pause")}
                        className="px-3 py-1 text-sm tracking-widest bg-orange-900/50 border border-orange-600 text-orange-400 hover:bg-orange-800/50"
                      >
                        PAUSE
                      </button>
                      <button
                        onClick={() => handleActivate(selectedCampaign.id, "complete")}
                        className="px-3 py-1 text-sm tracking-widest bg-cyan-900/50 border border-cyan-600 text-cyan-400 hover:bg-cyan-800/50"
                      >
                        COMPLETE
                      </button>
                    </>
                  )}
                  {selectedCampaign.status === "PAUSED" && (
                    <button
                      onClick={() => handleActivate(selectedCampaign.id, "activate")}
                      className="px-3 py-1 text-sm tracking-widest bg-green-900/50 border border-green-600 text-green-400 hover:bg-green-800/50"
                    >
                      RESUME
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedCampaign.id)}
                    className="px-3 py-1 text-sm tracking-widest bg-red-900/50 border border-red-600 text-red-400 hover:bg-red-800/50"
                  >
                    DELETE
                  </button>
                </div>
              </div>
              <div className="mt-3 text-cyan-500">{selectedCampaign.description}</div>
              {selectedCampaign.narrative && (
                <div className="mt-2 p-3 bg-cyan-950/30 border-l-4 border-cyan-600 text-cyan-400 text-sm italic">
                  {selectedCampaign.narrative}
                </div>
              )}
              <div className="flex gap-6 mt-3 text-sm">
                <div className="text-cyan-700">
                  Min Trust: <span className="text-cyan-400">{selectedCampaign.minTrust || 0}</span>
                </div>
                <div className="text-cyan-700">
                  Max Agents: <span className="text-cyan-400">{selectedCampaign.maxAgents || "∞"}</span>
                </div>
                <div className="text-cyan-700">
                  Auto-assign: <span className="text-cyan-400">{selectedCampaign.autoAssign ? "YES" : "NO"}</span>
                </div>
                {selectedCampaign.deadline && (
                  <div className="text-cyan-700">
                    Deadline: <span className="text-cyan-400">{new Date(selectedCampaign.deadline).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Phases & Objectives */}
              <div className="mb-6">
                <div className="text-cyan-400 tracking-widest mb-3">PHASES & OBJECTIVES</div>
                {selectedCampaign.phases?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCampaign.phases.sort((a: any, b: any) => a.order - b.order).map((phase: any) => (
                      <div key={phase.id} className="border border-cyan-800 bg-black/50">
                        <div className="p-3 bg-cyan-950/30 border-b border-cyan-800 flex justify-between items-center">
                          <div>
                            <span className="text-cyan-400 tracking-widest">PHASE {phase.order}: {phase.name}</span>
                            <span className={`ml-3 px-2 py-0.5 text-xs tracking-widest border ${statusColor(phase.status)}`}>
                              {phase.status}
                            </span>
                          </div>
                          <div className="text-cyan-600 text-xs">
                            {phase.objectives?.length || 0} objectives
                          </div>
                        </div>
                        {phase.description && (
                          <div className="p-3 text-cyan-500 text-sm border-b border-cyan-900/50">
                            {phase.description}
                          </div>
                        )}
                        {phase.objectives?.length > 0 && (
                          <div className="divide-y divide-cyan-900/50">
                            {phase.objectives.map((obj: any) => (
                              <div key={obj.id} className="p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="text-cyan-300">{obj.title}</div>
                                    <div className="text-cyan-600 text-xs mt-1">
                                      <span className={objectiveTypeColor(obj.type)}>{obj.type}</span>
                                      {obj.targetContributions > 1 && (
                                        <span className="ml-2">({obj.targetContributions} required)</span>
                                      )}
                                      <span className="ml-2">{obj.points} pts</span>
                                    </div>
                                  </div>
                                  <span className={`px-2 py-0.5 text-xs tracking-widest border ${statusColor(obj.status)}`}>
                                    {obj.status}
                                  </span>
                                </div>
                                <div className="text-cyan-500 text-sm mt-2">{obj.briefing}</div>
                                {obj._count?.contributions > 0 && (
                                  <div className="mt-2 text-cyan-700 text-xs">
                                    {obj._count.contributions} contribution{obj._count.contributions !== 1 ? "s" : ""}
                                    {obj.type === "COLLABORATIVE" && ` / ${obj.targetContributions} needed`}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-cyan-700 text-center p-8 border border-cyan-900">
                    No phases defined. Use LOGOS to add phases and objectives.
                  </div>
                )}
              </div>

              {/* Participants */}
              {selectedCampaign.participations?.length > 0 && (
                <div className="mb-6">
                  <div className="text-cyan-400 tracking-widest mb-3">PARTICIPANTS ({selectedCampaign.participations.length})</div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCampaign.participations.map((p: any) => (
                      <div key={p.id} className="p-2 border border-cyan-900 bg-black/30 flex justify-between items-center">
                        <div>
                          <div className="text-cyan-300">{p.user?.handle || p.userId}</div>
                          <div className="text-cyan-600 text-xs">{p.role}</div>
                        </div>
                        <span className={`px-2 py-0.5 text-xs border ${p.status === "active" ? "text-green-400 border-green-600" : "text-gray-400 border-gray-600"}`}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Events */}
              {selectedCampaign.events?.length > 0 && (
                <div>
                  <div className="text-cyan-400 tracking-widest mb-3">RECENT EVENTS</div>
                  <div className="space-y-2">
                    {selectedCampaign.events.slice(0, 10).map((event: any) => (
                      <div key={event.id} className="p-2 border-l-2 border-cyan-700 bg-black/30 text-sm">
                        <div className="flex justify-between">
                          <span className="text-cyan-400">{event.type.replace(/_/g, " ").toUpperCase()}</span>
                          <span className="text-cyan-700">{new Date(event.createdAt).toLocaleString()}</span>
                        </div>
                        {event.narrative && <div className="text-cyan-500 mt-1">{event.narrative}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-cyan-700 text-xl">
            SELECT A CAMPAIGN TO VIEW DETAILS
          </div>
        )}
      </div>
    </div>
  );
}

