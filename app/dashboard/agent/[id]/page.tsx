"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

const ADMIN_AUTH_KEY = "p89_admin_auth";

interface ExperimentEvent {
  observation: string;
  result: string | null;
  score: number | null;
  createdAt: string;
}

interface Experiment {
  id: string;
  hypothesis: string;
  task: string | null;
  successCriteria: string | null;
  title: string | null;
  createdAt: string;
  events: ExperimentEvent[];
}

interface MemoryEvent {
  id: string;
  type: string;
  content: string;
  tags: string[];
  createdAt: string;
}

interface AgentDossier {
  id: string;
  handle: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  layer: number;
  trustScore: number;
  profile: {
    codename: string | null;
    location: { lat: number; lng: number; city?: string; country?: string } | null;
    psychProfile: {
      primaryTraits: string[];
      motivations: string[];
      fears: string[];
      cognitiveStyle: string;
      emotionalBaseline: string;
      decisionPattern: string;
    } | null;
    tags: string[];
    proclivities: { [key: string]: number } | null;
    strengths: string[];
    weaknesses: string[];
    interests: string[];
    communicationStyle: {
      preferred: string;
      formality: number;
      verbosity: number;
      humor: number;
    } | null;
    riskTolerance: number;
    loyaltyIndex: number;
    creativityIndex: number;
    analyticalIndex: number;
    adminNotes: string | null;
    adminDirectives: string | null;
    assignedMissions: string[] | null;
    watchlist: boolean;
    flagged: boolean;
    flagReason: string | null;
    dashboardEnabled: boolean;
    dossierGeneratedAt: string | null;
    dossierVersion: number;
    traits: { [key: string]: any } | null;
    skills: { [key: string]: number } | null;
  } | null;
  stats: {
    totalSessions: number;
    totalMessages: number;
    totalMissions: number;
    completedMissions: number;
    totalRewards: number;
    dreamEntries: number;
    synchronicities: number;
    knowledgeNodes: number;
    fieldMissions: number;
  };
  recentSessions: Array<{
    id: string;
    createdAt: string;
    status: string;
    messageCount: number;
  }>;
  missionHistory: Array<{
    id: string;
    title: string;
    status: string;
    score: number | null;
    createdAt: string;
  }>;
  experiments?: Experiment[];
  memory?: MemoryEvent[];
  gameSessions?: Array<{
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
    messages: Array<{ role: string; content: string; createdAt: string }>;
  }>;
}

const LAYER_COLORS: Record<number, string> = {
  0: "#666666",
  1: "#00aaff",
  2: "#00ff88",
  3: "#ffaa00",
  4: "#ff4444",
  5: "#ff00ff",
};

const LAYER_NAMES = ["UNVERIFIED", "INITIATE", "AGENT", "OPERATIVE", "HANDLER", "ARCHITECT"];

function StatBar({ label, value, max = 1, color = "#00ffff" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-cyan-600 uppercase tracking-wider">{label}</span>
        <span className="text-cyan-400">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-black border border-cyan-800">
        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function Section({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-black/60 border-2 border-cyan-800 ${className}`}>
      <div className="bg-cyan-900/30 px-4 py-2 border-b border-cyan-800">
        <span className="text-cyan-500 text-sm tracking-widest font-bold">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function AgentDossierPage() {
  const params = useParams();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [dossier, setDossier] = useState<AgentDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "missions" | "research" | "admin">("profile");
  const [adminNotes, setAdminNotes] = useState("");
  const [adminDirectives, setAdminDirectives] = useState("");
  const [saving, setSaving] = useState(false);
  const [availableMissions, setAvailableMissions] = useState<Array<{id: string; title: string; type: string; prompt: string}>>([]);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [playbackSession, setPlaybackSession] = useState<string | null>(null);
  const [flagReasonInput, setFlagReasonInput] = useState("");

  const agentId = params?.id as string | undefined;

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
    router.push("/dashboard");
  }, [router]);

  useEffect(() => {
    if (!authenticated || !agentId) return;
    Promise.all([
        fetch(`/api/admin/agents/${agentId}`).then((r) => r.json()),
        fetch(`/api/admin/missions`).then((r) => r.json()),
      ])
        .then(([agentData, missionsData]) => {
          setDossier(agentData);
          setAdminNotes(agentData.profile?.adminNotes || "");
          setAdminDirectives(agentData.profile?.adminDirectives || "");
          setAvailableMissions(missionsData.missions || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
  }, [authenticated, agentId]);

  const updateProfile = useCallback(async (updates: Record<string, any>) => {
    if (!dossier) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/agents/${dossier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.profile) {
        setDossier((prev) => prev ? { ...prev, profile: data.profile } : null);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  }, [dossier]);

  const handleSaveAdmin = async () => {
    await updateProfile({ adminNotes, adminDirectives });
  };

  const handleToggleWatchlist = async () => {
    if (!dossier?.profile) return;
    await updateProfile({ watchlist: !dossier.profile.watchlist });
  };

  const handleToggleFlag = async () => {
    if (!dossier?.profile) return;
    if (dossier.profile.flagged) {
      await updateProfile({ flagged: false, flagReason: null });
    } else {
      await updateProfile({ flagged: true, flagReason: flagReasonInput || "Manual review required" });
      setFlagReasonInput("");
    }
  };

  const handleAssignMission = async (mission: {id: string; title: string; type: string; prompt: string}) => {
    if (!dossier?.profile) return;
    const current = (dossier.profile.assignedMissions as any[]) || [];
    const newMission = { id: mission.id, title: mission.title, type: mission.type, description: mission.prompt.slice(0, 100) };
    await updateProfile({ assignedMissions: [...current, newMission] });
    setShowMissionModal(false);
  };

  const handleRemoveMission = async (index: number) => {
    if (!dossier?.profile) return;
    const current = (dossier.profile.assignedMissions as any[]) || [];
    const updated = current.filter((_, i) => i !== index);
    await updateProfile({ assignedMissions: updated });
  };

  const handleGenerateDossier = async () => {
    if (!dossier) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/agents/${dossier.id}/generate-dossier`, { method: "POST" });
      const updated = await res.json();
      setDossier((prev) => prev ? { ...prev, profile: updated.profile } : null);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse font-mono tracking-widest text-2xl">ACCESSING DOSSIER...</div>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 font-mono tracking-widest text-2xl">AGENT NOT FOUND</div>
      </div>
    );
  }

  const profile = dossier.profile;
  const psychProfile = profile?.psychProfile;

  return (
    <div className="min-h-screen bg-black text-cyan-400 font-mono">
      <div className="fixed inset-0 opacity-5 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwZmZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]" />

      <header className="bg-black/90 border-b-2 border-cyan-700 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => router.push("/dashboard")} className="text-cyan-600 hover:text-cyan-400 transition">
              ← BACK TO OVERWATCH
            </button>
            <div className="h-8 w-px bg-cyan-800" />
            <div>
              <div className="text-cyan-500 text-xs tracking-widest">OPERATIVE DOSSIER</div>
              <div className="text-2xl font-bold text-cyan-300">{profile?.codename || dossier.handle || `AGENT-${dossier.id.slice(0, 8).toUpperCase()}`}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {profile?.flagged && (
              <div className="bg-red-900/50 border border-red-500 px-3 py-1 text-red-400 text-sm animate-pulse">
                ⚠ FLAGGED: {profile.flagReason || "REVIEW REQUIRED"}
              </div>
            )}
            {profile?.watchlist && (
              <div className="bg-cyan-900/50 border border-cyan-500 px-3 py-1 text-cyan-400 text-sm">
                👁 WATCHLIST
              </div>
            )}
            <div className="text-right">
              <div className="text-xs text-cyan-700">CLEARANCE LEVEL</div>
              <div className="text-xl font-bold" style={{ color: LAYER_COLORS[dossier.layer] }}>
                {LAYER_NAMES[dossier.layer]} (L{dossier.layer})
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          {(["profile", "missions", "research", "admin"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm tracking-widest transition border-b-2 ${
                activeTab === tab
                  ? "text-cyan-300 border-cyan-400"
                  : "text-cyan-700 border-transparent hover:text-cyan-500"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main className="p-6 relative z-10">
        {activeTab === "profile" && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4 space-y-6">
              <Section title="IDENTIFICATION">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-cyan-700">AGENT ID</span>
                    <span className="text-cyan-300 font-bold">{dossier.id.slice(0, 12).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-700">HANDLE</span>
                    <span className="text-cyan-300">{dossier.handle || "CLASSIFIED"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-700">CODENAME</span>
                    <span className="text-cyan-400 font-bold">{profile?.codename || "UNASSIGNED"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-700">RECRUITED</span>
                    <span className="text-cyan-300">{new Date(dossier.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-700">LOCATION</span>
                    <span className="text-cyan-300">
                      {profile?.location ? `${(profile.location as any).city}, ${(profile.location as any).country}` : "UNKNOWN"}
                    </span>
                  </div>
                </div>
              </Section>

              <Section title="OPERATIONAL METRICS">
                <StatBar label="Trust Index" value={dossier.trustScore} color="#00ff88" />
                <StatBar label="Risk Tolerance" value={profile?.riskTolerance || 0.5} color="#ffaa00" />
                <StatBar label="Loyalty Index" value={profile?.loyaltyIndex || 0.5} color="#00aaff" />
                <StatBar label="Creativity" value={profile?.creativityIndex || 0.5} color="#ff00ff" />
                <StatBar label="Analytical" value={profile?.analyticalIndex || 0.5} color="#00ffff" />
              </Section>

              <Section title="ACTIVITY SUMMARY">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-cyan-900/20 border border-cyan-800 p-3">
                    <div className="text-2xl font-bold text-cyan-300">{dossier.stats.totalSessions}</div>
                    <div className="text-xs text-cyan-700">SESSIONS</div>
                  </div>
                  <div className="bg-cyan-900/20 border border-cyan-800 p-3">
                    <div className="text-2xl font-bold text-cyan-300">{dossier.stats.totalMessages}</div>
                    <div className="text-xs text-cyan-700">MESSAGES</div>
                  </div>
                  <div className="bg-cyan-900/20 border border-cyan-800 p-3">
                    <div className="text-2xl font-bold text-green-400">{dossier.stats.completedMissions}</div>
                    <div className="text-xs text-cyan-700">COMPLETED</div>
                  </div>
                  <div className="bg-cyan-900/20 border border-cyan-800 p-3">
                    <div className="text-2xl font-bold text-cyan-400">{dossier.stats.totalRewards}</div>
                    <div className="text-xs text-cyan-700">REWARDS</div>
                  </div>
                </div>
              </Section>
            </div>

            <div className="col-span-5 space-y-6">
              <Section title="PSYCHOLOGICAL PROFILE">
                {psychProfile ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-cyan-500 mb-2">PRIMARY TRAITS</div>
                      <div className="flex flex-wrap gap-2">
                        {psychProfile.primaryTraits?.map((trait) => (
                          <span key={trait} className="bg-cyan-900/40 border border-cyan-700 px-2 py-1 text-sm text-cyan-300">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-cyan-500 mb-2">MOTIVATIONS</div>
                      <ul className="text-sm text-cyan-400 space-y-1">
                        {psychProfile.motivations?.map((m, i) => <li key={i}>• {m}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs text-cyan-500 mb-2">IDENTIFIED FEARS</div>
                      <ul className="text-sm text-red-400/80 space-y-1">
                        {psychProfile.fears?.map((f, i) => <li key={i}>• {f}</li>)}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-cyan-800">
                      <div>
                        <div className="text-xs text-cyan-700">COGNITIVE STYLE</div>
                        <div className="text-cyan-300">{psychProfile.cognitiveStyle}</div>
                      </div>
                      <div>
                        <div className="text-xs text-cyan-700">EMOTIONAL BASELINE</div>
                        <div className="text-cyan-300">{psychProfile.emotionalBaseline}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-cyan-700">DECISION PATTERN</div>
                        <div className="text-cyan-300">{psychProfile.decisionPattern}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-cyan-700 mb-4">PSYCHOLOGICAL PROFILE NOT GENERATED</div>
                    <button
                      onClick={handleGenerateDossier}
                      disabled={saving}
                      className="bg-cyan-900/50 border border-cyan-500 px-4 py-2 text-cyan-300 hover:bg-cyan-800/50 transition disabled:opacity-50"
                    >
                      {saving ? "GENERATING..." : "GENERATE WITH LOGOS"}
                    </button>
                  </div>
                )}
              </Section>

              <Section title="SKILLS & CAPABILITIES">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-cyan-500 mb-2">STRENGTHS</div>
                    <ul className="text-sm text-green-400 space-y-1">
                      {profile?.strengths?.length ? profile.strengths.map((s, i) => <li key={i}>+ {s}</li>) : <li className="text-cyan-700">Not assessed</li>}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-cyan-500 mb-2">WEAKNESSES</div>
                    <ul className="text-sm text-red-400/80 space-y-1">
                      {profile?.weaknesses?.length ? profile.weaknesses.map((w, i) => <li key={i}>- {w}</li>) : <li className="text-cyan-700">Not assessed</li>}
                    </ul>
                  </div>
                </div>
                {profile?.skills && Object.keys(profile.skills).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-cyan-800">
                    <div className="text-xs text-cyan-500 mb-2">SKILL RATINGS</div>
                    {Object.entries(profile.skills).map(([skill, level]) => (
                      <StatBar key={skill} label={skill} value={level as number} color="#00ff88" />
                    ))}
                  </div>
                )}
              </Section>

              <Section title="INTERESTS & PROCLIVITIES">
                <div>
                  <div className="text-xs text-cyan-500 mb-2">INTERESTS</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile?.interests?.length ? profile.interests.map((i) => (
                      <span key={i} className="bg-purple-900/40 border border-purple-700 px-2 py-1 text-sm text-purple-300">
                        {i}
                      </span>
                    )) : <span className="text-cyan-700 text-sm">None recorded</span>}
                  </div>
                </div>
                {profile?.proclivities && Object.keys(profile.proclivities).length > 0 && (
                  <div className="pt-4 border-t border-cyan-800">
                    <div className="text-xs text-cyan-500 mb-2">BEHAVIORAL PROCLIVITIES</div>
                    {Object.entries(profile.proclivities).map(([proclivity, value]) => (
                      <StatBar key={proclivity} label={proclivity} value={value as number} color="#ff00ff" />
                    ))}
                  </div>
                )}
              </Section>
            </div>

            <div className="col-span-3 space-y-6">
              <Section title="CLASSIFICATION TAGS">
                <div className="flex flex-wrap gap-2">
                  {profile?.tags?.length ? profile.tags.map((tag) => (
                    <span key={tag} className="bg-cyan-900/40 border border-cyan-600 px-2 py-1 text-xs text-cyan-400 uppercase">
                      {tag}
                    </span>
                  )) : <span className="text-cyan-700 text-sm">No tags assigned</span>}
                </div>
              </Section>

              <Section title="COMMUNICATION PROFILE">
                {profile?.communicationStyle ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-cyan-700">PREFERRED</span>
                      <span className="text-cyan-300">{(profile.communicationStyle as any).preferred}</span>
                    </div>
                    <StatBar label="Formality" value={(profile.communicationStyle as any).formality || 0.5} color="#00aaff" />
                    <StatBar label="Verbosity" value={(profile.communicationStyle as any).verbosity || 0.5} color="#00ff88" />
                    <StatBar label="Humor" value={(profile.communicationStyle as any).humor || 0.5} color="#ffaa00" />
                  </div>
                ) : <span className="text-cyan-700 text-sm">Not analyzed</span>}
              </Section>

              <Section title="RECENT SESSIONS">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {dossier.recentSessions.length ? dossier.recentSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="bg-cyan-900/20 border border-cyan-800 p-2 cursor-pointer hover:bg-cyan-900/40 transition"
                      onClick={() => setPlaybackSession(playbackSession === session.id ? null : session.id)}
                    >
                      <div className="flex justify-between text-xs">
                        <span className="text-cyan-600">{new Date(session.createdAt).toLocaleDateString()}</span>
                        <span className={session.status === "OPEN" ? "text-green-400" : "text-cyan-700"}>{session.status}</span>
                      </div>
                      <div className="text-cyan-400 text-sm flex justify-between">
                        <span>{session.messageCount} messages</span>
                        <span className="text-cyan-600">PLAYBACK</span>
                      </div>
                    </div>
                  )) : <span className="text-cyan-700 text-sm">No sessions recorded</span>}
                </div>
              </Section>

              <Section title="DOSSIER STATUS">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-cyan-700">VERSION</span>
                    <span className="text-cyan-300">v{profile?.dossierVersion || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-700">GENERATED</span>
                    <span className="text-cyan-300">
                      {profile?.dossierGeneratedAt ? new Date(profile.dossierGeneratedAt).toLocaleString() : "NEVER"}
                    </span>
                  </div>
                  <button
                    onClick={handleGenerateDossier}
                    disabled={saving}
                    className="w-full mt-3 bg-cyan-900/50 border border-cyan-500 px-4 py-2 text-cyan-300 hover:bg-cyan-800/50 transition disabled:opacity-50 text-xs tracking-widest"
                  >
                    {saving ? "PROCESSING..." : "REGENERATE DOSSIER"}
                  </button>
                </div>
              </Section>
            </div>
          </div>
        )}

        {activeTab === "missions" && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8">
              <Section title="MISSION HISTORY">
                <div className="space-y-3">
                  {dossier.missionHistory.length ? dossier.missionHistory.map((mission) => (
                    <div key={mission.id} className="bg-cyan-900/20 border border-cyan-800 p-4 flex justify-between items-center">
                      <div>
                        <div className="text-cyan-300 font-bold">{mission.title}</div>
                        <div className="text-xs text-cyan-700">{new Date(mission.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${
                          mission.status === "COMPLETED" ? "text-green-400" :
                          mission.status === "FAILED" ? "text-red-400" :
                          "text-cyan-400"
                        }`}>
                          {mission.status}
                        </div>
                        {mission.score !== null && (
                          <div className="text-xs text-cyan-600">Score: {(mission.score * 100).toFixed(0)}%</div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-cyan-700">NO MISSIONS ON RECORD</div>
                  )}
                </div>
              </Section>
            </div>
            <div className="col-span-4">
              <Section title="MISSION STATS">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-cyan-300">{dossier.stats.totalMissions}</div>
                    <div className="text-xs text-cyan-700">TOTAL MISSIONS</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center bg-green-900/20 border border-green-800 p-3">
                      <div className="text-2xl font-bold text-green-400">{dossier.stats.completedMissions}</div>
                      <div className="text-xs text-green-700">COMPLETED</div>
                    </div>
                    <div className="text-center bg-red-900/20 border border-red-800 p-3">
                      <div className="text-2xl font-bold text-red-400">{dossier.stats.totalMissions - dossier.stats.completedMissions}</div>
                      <div className="text-xs text-red-700">INCOMPLETE</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-cyan-800">
                    <div className="text-xs text-cyan-500 mb-2">SUCCESS RATE</div>
                    <div className="text-3xl font-bold text-cyan-300">
                      {dossier.stats.totalMissions > 0
                        ? ((dossier.stats.completedMissions / dossier.stats.totalMissions) * 100).toFixed(0)
                        : 0}%
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="ASSIGNED MISSIONS" className="mt-6">
                <div className="space-y-2">
                  {profile?.assignedMissions?.length ? (
                    (profile.assignedMissions as string[]).map((m, i) => (
                      <div key={i} className="bg-cyan-900/20 border border-cyan-700 p-2 text-sm text-cyan-400">
                        {m}
                      </div>
                    ))
                  ) : (
                    <div className="text-cyan-700 text-sm">No individual assignments</div>
                  )}
                </div>
              </Section>
            </div>
          </div>
        )}

        {activeTab === "research" && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 space-y-6">
              <Section title="LOGOS EXPERIMENT LOG">
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {dossier.experiments?.length ? dossier.experiments.map((exp) => (
                    <div key={exp.id} className="bg-cyan-900/20 border border-cyan-800 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-cyan-300 font-bold">{exp.title || "Untitled Experiment"}</div>
                          <div className="text-cyan-700 text-xs mt-1">{new Date(exp.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="text-xs text-cyan-600 bg-cyan-900/50 px-2 py-1 border border-cyan-700">
                          {exp.events.length} observations
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-cyan-600">HYPOTHESIS:</span>
                          <span className="text-cyan-400 ml-2">{exp.hypothesis}</span>
                        </div>
                        {exp.task && (
                          <div>
                            <span className="text-cyan-600">TASK:</span>
                            <span className="text-cyan-400 ml-2">{exp.task}</span>
                          </div>
                        )}
                        {exp.successCriteria && (
                          <div>
                            <span className="text-cyan-600">SUCCESS CRITERIA:</span>
                            <span className="text-cyan-400 ml-2">{exp.successCriteria}</span>
                          </div>
                        )}
                      </div>
                      {exp.events.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-cyan-800">
                          <div className="text-xs text-cyan-500 mb-2">OBSERVATIONS</div>
                          <div className="space-y-2">
                            {exp.events.map((event, idx) => (
                              <div key={idx} className="bg-black/50 border border-cyan-900 p-2 text-xs">
                                <div className="flex justify-between text-cyan-700 mb-1">
                                  <span>{new Date(event.createdAt).toLocaleString()}</span>
                                  {event.score !== null && (
                                    <span className="text-cyan-400">Score: {(event.score * 100).toFixed(0)}%</span>
                                  )}
                                </div>
                                <div className="text-cyan-400">{event.observation}</div>
                                {event.result && (
                                  <div className="text-green-400 mt-1">Result: {event.result}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="text-center py-8 text-cyan-700">NO EXPERIMENTS RECORDED</div>
                  )}
                </div>
              </Section>
            </div>

            <div className="col-span-4 space-y-6">
              <Section title="EXPERIMENT STATS">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-cyan-900/20 border border-cyan-800 p-3">
                    <div className="text-2xl font-bold text-cyan-300">{dossier.experiments?.length || 0}</div>
                    <div className="text-xs text-cyan-700">EXPERIMENTS</div>
                  </div>
                  <div className="bg-cyan-900/20 border border-cyan-800 p-3">
                    <div className="text-2xl font-bold text-cyan-300">
                      {dossier.experiments?.reduce((acc, e) => acc + e.events.length, 0) || 0}
                    </div>
                    <div className="text-xs text-cyan-700">OBSERVATIONS</div>
                  </div>
                </div>
              </Section>

              <Section title="MEMORY EVENTS">
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {dossier.memory?.length ? dossier.memory.slice(0, 50).map((mem) => (
                    <div key={mem.id} className="bg-cyan-900/20 border border-cyan-800 p-2 text-xs">
                      <div className="flex justify-between text-cyan-700 mb-1">
                        <span className="font-bold text-cyan-500">{mem.type}</span>
                        <span>{new Date(mem.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-cyan-400 line-clamp-3">{mem.content}</div>
                      {mem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {mem.tags.map((tag, i) => (
                            <span key={i} className="bg-cyan-900/50 px-1 text-cyan-600">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="text-cyan-700 text-sm">No memory events recorded</div>
                  )}
                </div>
              </Section>

              <Section title="ACTIVE HYPOTHESES">
                <div className="space-y-2">
                  {dossier.experiments?.filter(e => e.events.length === 0).slice(0, 5).map((exp) => (
                    <div key={exp.id} className="bg-yellow-900/20 border border-yellow-800 p-2 text-xs">
                      <div className="text-yellow-400">{exp.hypothesis}</div>
                      <div className="text-yellow-700 mt-1">{new Date(exp.createdAt).toLocaleDateString()}</div>
                    </div>
                  )) || null}
                  {(!dossier.experiments?.filter(e => e.events.length === 0).length) && (
                    <div className="text-cyan-700 text-sm">No pending experiments</div>
                  )}
                </div>
              </Section>
            </div>
          </div>
        )}

        {activeTab === "admin" && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-6">
              <Section title="ADMIN NOTES">
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes about this operative..."
                  className="w-full h-40 bg-black border border-cyan-800 p-3 text-cyan-300 placeholder:text-cyan-800 focus:border-cyan-500 focus:outline-none resize-none font-mono text-sm"
                />
              </Section>

              <Section title="LLM DIRECTIVE INJECTION" className="mt-6">
                <div className="text-xs text-cyan-500 mb-2">
                  Custom instructions injected into LOGOS when interacting with this agent
                </div>
                <textarea
                  value={adminDirectives}
                  onChange={(e) => setAdminDirectives(e.target.value)}
                  placeholder="Example: Be more encouraging with this agent. Focus on analytical tasks. Test their creativity."
                  className="w-full h-40 bg-black border border-cyan-800 p-3 text-cyan-300 placeholder:text-cyan-900 focus:border-cyan-500 focus:outline-none resize-none font-mono text-sm"
                />
              </Section>

              <button
                onClick={handleSaveAdmin}
                disabled={saving}
                className="mt-4 w-full bg-cyan-900/50 border-2 border-cyan-500 px-6 py-3 text-cyan-300 hover:bg-cyan-800/50 transition disabled:opacity-50 tracking-widest font-bold"
              >
                {saving ? "SAVING..." : "SAVE CHANGES"}
              </button>

              <Section title="TRUST OVERRIDE" className="mt-6">
                <div className="text-xs text-yellow-500 mb-3">
                  Manually override trust score and access layer
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-cyan-600">LAYER</span>
                      <span className="text-cyan-400">{LAYER_NAMES[dossier.layer]} (L{dossier.layer})</span>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5].map((l) => (
                        <button
                          key={l}
                          onClick={() => {
                            const newTrust = l === 0 ? 0 : l === 1 ? 0.2 : l === 2 ? 0.4 : l === 3 ? 0.6 : l === 4 ? 0.8 : 0.98;
                            updateProfile({ layer: l, trustScore: newTrust });
                            setDossier((prev) => prev ? { ...prev, layer: l, trustScore: newTrust } : null);
                          }}
                          disabled={saving}
                          className={`flex-1 py-2 text-xs font-bold border transition ${
                            dossier.layer === l
                              ? "border-2"
                              : "border-cyan-800 opacity-50 hover:opacity-100"
                          }`}
                          style={{ 
                            backgroundColor: dossier.layer === l ? LAYER_COLORS[l] + "40" : "transparent",
                            borderColor: LAYER_COLORS[l],
                            color: LAYER_COLORS[l]
                          }}
                        >
                          L{l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-cyan-600">TRUST SCORE</span>
                      <span className="text-cyan-400">{(dossier.trustScore * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={dossier.trustScore * 100}
                      onChange={(e) => {
                        const newTrust = parseInt(e.target.value) / 100;
                        setDossier((prev) => prev ? { ...prev, trustScore: newTrust } : null);
                      }}
                      onMouseUp={(e) => {
                        const newTrust = parseInt((e.target as HTMLInputElement).value) / 100;
                        updateProfile({ trustScore: newTrust });
                      }}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>
              </Section>
            </div>

            <div className="col-span-6">
              <Section title="AGENT FLAGS">
                <div className="space-y-4">
                  <div 
                    className="flex items-center justify-between p-3 bg-green-900/20 border border-green-800 cursor-pointer hover:bg-green-900/30 transition"
                    onClick={() => updateProfile({ dashboardEnabled: !profile?.dashboardEnabled })}
                  >
                    <div>
                      <div className="text-green-400 font-bold">OPERATIVE DASHBOARD</div>
                      <div className="text-xs text-green-700">Allow access to /operative hub</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${profile?.dashboardEnabled ? "bg-green-400 shadow-[0_0_10px_rgba(0,255,0,0.5)]" : "bg-gray-700"}`} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-cyan-900/20 border border-cyan-800">
                    <div>
                      <div className="text-cyan-400 font-bold">WATCHLIST</div>
                      <div className="text-xs text-cyan-700">Flag for monitoring</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${profile?.watchlist ? "bg-yellow-400" : "bg-gray-700"}`} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-900/20 border border-red-800">
                    <div>
                      <div className="text-red-400 font-bold">FLAGGED</div>
                      <div className="text-xs text-red-700">{profile?.flagReason || "No reason specified"}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${profile?.flagged ? "bg-red-400 animate-pulse" : "bg-gray-700"}`} />
                  </div>
                </div>
              </Section>

              <Section title="INDIVIDUAL MISSION ASSIGNMENT" className="mt-6">
                <div className="text-xs text-cyan-700 mb-4">
                  Assign specific missions that only this agent will receive
                </div>
                <div className="space-y-2">
                  {profile?.assignedMissions?.length ? (
                    (profile.assignedMissions as any[]).map((m, i) => (
                      <div key={i} className="flex items-center justify-between bg-cyan-900/20 border border-cyan-800 p-2">
                        <div>
                          <span className="text-cyan-300 text-sm font-bold">{m.title || m}</span>
                          {m.type && <span className="ml-2 text-cyan-700 text-xs">[{m.type}]</span>}
                        </div>
                        <button 
                          onClick={() => handleRemoveMission(i)}
                          className="text-red-500 hover:text-red-400 text-xs"
                        >
                          REMOVE
                        </button>
                      </div>
                    ))
                  ) : null}
                  <button 
                    onClick={() => setShowMissionModal(true)}
                    className="w-full border border-dashed border-cyan-700 p-3 text-cyan-700 hover:border-cyan-500 hover:text-cyan-500 transition text-sm"
                  >
                    + ASSIGN NEW MISSION
                  </button>
                </div>
              </Section>

              <Section title="DANGER ZONE" className="mt-6">
                <div className="space-y-3">
                  <button 
                    onClick={handleToggleWatchlist}
                    disabled={saving}
                    className={`w-full border p-3 transition text-sm tracking-widest disabled:opacity-50 ${
                      profile?.watchlist 
                        ? "bg-yellow-900/30 border-yellow-500 text-yellow-400 hover:bg-yellow-900/50" 
                        : "bg-cyan-900/30 border-cyan-600 text-cyan-500 hover:bg-cyan-900/50"
                    }`}
                  >
                    {profile?.watchlist ? "ON WATCHLIST - CLICK TO REMOVE" : "ADD TO WATCHLIST"}
                  </button>
                  <div className="space-y-2">
                    {!profile?.flagged && (
                      <input
                        type="text"
                        value={flagReasonInput}
                        onChange={(e) => setFlagReasonInput(e.target.value)}
                        placeholder="Flag reason (optional)..."
                        className="w-full bg-black border border-red-800 p-2 text-red-300 placeholder:text-red-900 text-sm focus:border-red-500 focus:outline-none"
                      />
                    )}
                    <button 
                      onClick={handleToggleFlag}
                      disabled={saving}
                      className={`w-full border p-3 transition text-sm tracking-widest disabled:opacity-50 ${
                        profile?.flagged 
                          ? "bg-red-900/50 border-red-500 text-red-400 hover:bg-red-800/50 animate-pulse" 
                          : "bg-red-900/30 border-red-600 text-red-500 hover:bg-red-900/50"
                      }`}
                    >
                      {profile?.flagged ? "FLAGGED - CLICK TO UNFLAG" : "FLAG FOR REVIEW"}
                    </button>
                  </div>
                  <button className="w-full bg-red-900/50 border-2 border-red-500 p-3 text-red-400 hover:bg-red-800/50 transition text-sm tracking-widest font-bold">
                    TERMINATE AGENT ACCESS
                  </button>
                </div>
              </Section>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-cyan-800 px-6 py-2 flex justify-between items-center z-50">
        <div className="text-xs text-cyan-700">
          DOSSIER ID: {dossier.id} | LAST UPDATED: {profile?.dossierGeneratedAt ? new Date(profile.dossierGeneratedAt).toLocaleString() : "N/A"}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400">SECURE CONNECTION</span>
        </div>
      </footer>

      {showMissionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
          <div className="bg-black border-2 border-cyan-600 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="bg-cyan-900/30 px-4 py-3 border-b border-cyan-800 flex justify-between items-center">
              <span className="text-cyan-400 tracking-widest font-bold">SELECT MISSION TO ASSIGN</span>
              <button onClick={() => setShowMissionModal(false)} className="text-cyan-600 hover:text-cyan-400">X</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {availableMissions.length ? availableMissions.map((mission) => (
                <div 
                  key={mission.id}
                  onClick={() => handleAssignMission(mission)}
                  className="bg-cyan-900/20 border border-cyan-800 p-3 cursor-pointer hover:bg-cyan-900/40 hover:border-cyan-600 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-cyan-300 font-bold">{mission.title}</div>
                      <div className="text-cyan-700 text-xs mt-1">{mission.type.toUpperCase()}</div>
                    </div>
                    <span className="text-cyan-600 text-xs">+ ASSIGN</span>
                  </div>
                  <div className="text-cyan-500 text-sm mt-2 line-clamp-2">{mission.prompt}</div>
                </div>
              )) : (
                <div className="text-cyan-700 text-center py-8">No missions available. Create missions in the Missions tab.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {playbackSession && (
        <SessionPlayback 
          agentId={dossier.id} 
          sessionId={playbackSession} 
          onClose={() => setPlaybackSession(null)} 
        />
      )}
    </div>
  );
}

function SessionPlayback({ agentId, sessionId, onClose }: { agentId: string; sessionId: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{role: string; content: string; createdAt: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/agents/${agentId}`)
      .then(r => r.json())
      .then(data => {
        const session = data.gameSessions?.find((s: any) => s.id === sessionId);
        if (session?.messages) {
          setMessages(session.messages);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [agentId, sessionId]);

  useEffect(() => {
    if (playing && currentIndex < messages.length - 1) {
      const timer = setTimeout(() => setCurrentIndex(i => i + 1), 1500);
      return () => clearTimeout(timer);
    } else if (currentIndex >= messages.length - 1) {
      setPlaying(false);
    }
  }, [playing, currentIndex, messages.length]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100]">
        <div className="text-cyan-400 animate-pulse">LOADING SESSION...</div>
      </div>
    );
  }

  const visibleMessages = messages.slice(0, currentIndex + 1);

  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col z-[100]">
      <div className="bg-black border-b-2 border-cyan-700 px-6 py-4 flex justify-between items-center">
        <div>
          <div className="text-cyan-500 text-xs tracking-widest">SESSION PLAYBACK</div>
          <div className="text-cyan-300 font-bold">{sessionId.slice(0, 12).toUpperCase()}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-cyan-600 text-sm">
            {currentIndex + 1} / {messages.length} messages
          </div>
          <button 
            onClick={() => setCurrentIndex(0)}
            className="text-cyan-600 hover:text-cyan-400 px-2"
          >
            |&lt;
          </button>
          <button 
            onClick={() => setPlaying(!playing)}
            className="bg-cyan-900/50 border border-cyan-600 px-4 py-2 text-cyan-400 hover:bg-cyan-800/50"
          >
            {playing ? "PAUSE" : "PLAY"}
          </button>
          <button 
            onClick={() => setCurrentIndex(messages.length - 1)}
            className="text-cyan-600 hover:text-cyan-400 px-2"
          >
            &gt;|
          </button>
          <button onClick={onClose} className="text-cyan-600 hover:text-cyan-400 ml-4">X CLOSE</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 font-mono">
        <div className="max-w-4xl mx-auto space-y-4">
          {visibleMessages.map((msg, i) => (
            <div 
              key={i} 
              className={`p-4 border ${
                msg.role === "user" 
                  ? "bg-cyan-900/20 border-cyan-800 ml-12" 
                  : "bg-black border-cyan-700 mr-12"
              } ${i === currentIndex ? "animate-pulse" : ""}`}
            >
              <div className="flex justify-between text-xs text-cyan-700 mb-2">
                <span>{msg.role.toUpperCase()}</span>
                <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className={`whitespace-pre-wrap ${msg.role === "user" ? "text-cyan-300" : "text-cyan-400"}`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black border-t border-cyan-800 px-6 py-3">
        <input 
          type="range" 
          min={0} 
          max={messages.length - 1} 
          value={currentIndex}
          onChange={(e) => { setPlaying(false); setCurrentIndex(Number(e.target.value)); }}
          className="w-full accent-cyan-500"
        />
      </div>
    </div>
  );
}
