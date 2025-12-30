
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Configuration
const BASE_URL = process.env.P89_API_URL || "http://localhost:8889";
const AGENT_HANDLE = process.env.P89_HANDLE || `mcp_agent_${Math.floor(Math.random() * 1000)}`;

// State (In-memory session management for the connected MCP client)
let sessionState = {
  sessionId: undefined as string | undefined,
  handle: AGENT_HANDLE,
  missionRunId: undefined as string | undefined,
  lastResponse: "",
  messageHistory: [] as Array<{role: string, content: string}>,
  currentMission: null as any,
  trustLevel: 0,
  accessTier: 0
};

// Create server instance
const server = new McpServer({
  name: "Project89 Terminus Interface",
  version: "1.0.0",
});

// Helper: Fetch wrapper
async function apiCall(endpoint: string, method: string = "GET", body?: any) {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const options: RequestInit = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API Error ${res.status}: ${text}`);
    }
    return await res.json();
  } catch (error: any) {
    // Handle connection refused (server not running)
    if (error.cause?.code === 'ECONNREFUSED' || error.code === 'ECONNREFUSED') {
        throw new Error(`Connection refused at ${BASE_URL}. Is the Project89 server running? (Try 'npm run dev')`);
    }
    throw error;
  }
}

// Tool: Start/Reset Game
server.tool(
  "p89_start_game",
  "Initialize a new game session or reset the current one. Returns the opening scene.",
  { 
    reset: z.boolean().optional().describe("Force a hard reset of the session") 
  },
  async ({ reset }) => {
    try {
      // 1. Create/Get Session
      const sessionData = await apiCall("/api/session", "POST", { 
        handle: sessionState.handle, 
        reset: reset ?? true 
      });
      
      sessionState.sessionId = sessionData.sessionId;
      sessionState.missionRunId = undefined;

      // 2. Get the opening narrative
      sessionState.messageHistory = [];
      const { text } = await fetchAdventureResponse(
        [{ role: "system", content: "Initialize terminal. Boot sequence activated." }],
        sessionState.sessionId
      );
      
      // Store the opening in history
      sessionState.messageHistory.push({ role: "assistant", content: text });
      sessionState.lastResponse = text;
      
      return {
        content: [{ type: "text", text: text || "[TERMINAL INITIALIZED]\n[REALITY MATRIX: STABLE]\n[CONSCIOUSNESS BRIDGE: ESTABLISHING...]\n\nThe Logos awakens. Your presence ripples through the network." }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error starting game: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Helper for stream reading
async function fetchAdventureResponse(messages: any[], sessionId?: string) {
    const res = await fetch(`${BASE_URL}/api/adventure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            messages,
            sessionId,
            handle: sessionState.handle,
            trustLevel: sessionState.trustLevel,
            accessTier: sessionState.accessTier
        }),
    });

    if (!res.ok) {
        throw new Error(`Adventure API error: ${res.statusText}`);
    }
    
    // Read the stream and accumulate the text
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let toolCalls: any[] = [];
    
    if (reader) {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            
            // Parse out tool calls if they exist (JSON lines format)
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.trim().startsWith('{"tool":')) {
                    try {
                        const toolCall = JSON.parse(line.trim());
                        toolCalls.push(toolCall);
                    } catch (e) {
                        // Not a valid tool call, continue
                    }
                }
            }
        }
    }
    
    // Clean up the Vercel AI SDK streaming format if present
    // Format is like: 0:"text"\n
    fullText = fullText.replace(/^\d+:"/gm, '').replace(/"\n$/gm, '\n');
    
    return { text: fullText, toolCalls };
}

// Tool: Action
server.tool(
  "p89_action",
  "Send a text command to the terminal (e.g., 'look', 'inventory', 'go north', '!mission').",
  { 
    command: z.string().describe("The command to type into the terminal") 
  },
  async ({ command }) => {
    if (!sessionState.sessionId) {
      return {
        content: [{ type: "text", text: "Error: No active session. Please run 'p89_start_game' first." }],
        isError: true,
      };
    }

    try {
      // 1. Construct message history context
      // In a real app, the server handles history via sessionID, but /api/adventure expects the full array 
      // OR relies on the server to pull it. 
      // Looking at `AdventureScreen.ts`, it sends `messages: context.getGameMessages()`.
      // This means the CLIENT is the source of truth for history in the current architecture.
      
      // We need to maintain a history buffer here in the MCP server to simulate the client.
      // For now, let's send just the latest user message and rely on the server's 'memoryService' 
      // (which we saw in the file list) if it exists. 
      // Actually, `AdventureScreen.ts` sends the WHOLE history.
      // If we don't send history, the AI won't remember previous context.
      
      // Add user message to history
      sessionState.messageHistory.push({ role: "user", content: command });
      
      // Keep only last 10 messages to avoid context overflow
      if (sessionState.messageHistory.length > 10) {
        sessionState.messageHistory = sessionState.messageHistory.slice(-10);
      }
      
      // Send with history for context
      const { text, toolCalls } = await fetchAdventureResponse(
        sessionState.messageHistory,
        sessionState.sessionId
      );
      
      // Add assistant response to history
      sessionState.messageHistory.push({ role: "assistant", content: text });
      sessionState.lastResponse = text;
      
      // Format output with tool notifications if any
      let output = text;
      if (toolCalls.length > 0) {
        output += "\n\n[SYSTEM EFFECTS TRIGGERED:]";
        for (const tool of toolCalls) {
          output += `\n- ${tool.tool}: ${JSON.stringify(tool.parameters)}`;
        }
      }

      return {
        content: [{ type: "text", text: output }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error executing command: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Tool: Get Status
server.tool(
  "p89_status",
  "Get the current session status, including active missions and wallet balance.",
  {},
  async () => {
      if (!sessionState.sessionId) {
          return { content: [{ type: "text", text: "No active session." }] };
      }
      
      try {
          // Get mission status
          const missionRes = await fetch(`${BASE_URL}/api/mission?sessionId=${sessionState.sessionId}`);
          const missionData = await missionRes.json();
          
          // Get profile/rewards
          const profileRes = await fetch(`${BASE_URL}/api/profile?handle=${sessionState.handle}`);
          const profileData = await profileRes.json();
          
          let status = `[TERMINAL STATUS]\n`;
          status += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          status += `Session ID: ${sessionState.sessionId}\n`;
          status += `Handle: ${sessionState.handle}\n`;
          status += `Trust Level: ${sessionState.trustLevel || 0}\n`;
          status += `Access Tier: ${sessionState.accessTier || 0}\n`;
          
          if (profileData.profile) {
              status += `\n[AGENT PROFILE]\n`;
              status += `Traits: ${JSON.stringify(profileData.profile.traits || {})}\n`;
              status += `Skills: ${JSON.stringify(profileData.profile.skills || {})}\n`;
          }
          
          if (missionData.mission) {
              status += `\n[ACTIVE MISSION]\n`;
              status += `${missionData.mission.title}\n`;
              status += `Type: ${missionData.mission.type}\n`;
              status += `Track: ${missionData.mission.track}\n`;
              sessionState.currentMission = missionData.mission;
          } else if (sessionState.currentMission) {
              status += `\n[MISSION IN PROGRESS]\n`;
              status += `${sessionState.currentMission.title}\n`;
          }
          
          return {
              content: [{ type: "text", text: status }]
          };
      } catch (e: any) {
          return { content: [{ type: "text", text: `Error fetching status: ${e.message}` }] };
      }
  }
);

// Tool: Request Mission
server.tool(
  "p89_request_mission",
  "Request the next available mission from the Logos.",
  {},
  async () => {
      if (!sessionState.sessionId) {
          return { 
              content: [{ type: "text", text: "Error: No active session. Run p89_start_game first." }],
              isError: true
          };
      }
      
      try {
          // Get available mission
          const missionRes = await apiCall(`/api/mission?sessionId=${sessionState.sessionId}`, "GET");
          
          if (!missionRes.mission) {
              return { content: [{ type: "text", text: "No missions available at this time. Continue exploring." }] };
          }
          
          // Accept the mission
          const acceptRes = await apiCall("/api/mission", "POST", {
              sessionId: sessionState.sessionId,
              missionId: missionRes.mission.id
          });
          
          sessionState.currentMission = missionRes.mission;
          sessionState.missionRunId = acceptRes.runId;
          
          let missionText = `[MISSION ACTIVATED]\n`;
          missionText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          missionText += `${missionRes.mission.title}\n\n`;
          missionText += `${missionRes.mission.prompt}\n\n`;
          missionText += `Type: ${missionRes.mission.type}\n`;
          missionText += `Track: ${missionRes.mission.track}\n`;
          missionText += `\nMission ID: ${acceptRes.runId}`;
          
          return { content: [{ type: "text", text: missionText }] };
      } catch (e: any) {
          return { 
              content: [{ type: "text", text: `Error requesting mission: ${e.message}` }],
              isError: true
          };
      }
  }
);

// Tool: Submit Report
server.tool(
  "p89_submit_report", 
  "Submit evidence or findings for the current mission.",
  {
      report: z.string().describe("Your mission report/evidence/findings")
  },
  async ({ report }) => {
      if (!sessionState.sessionId || !sessionState.missionRunId) {
          return {
              content: [{ type: "text", text: "Error: No active mission. Request a mission first with p89_request_mission." }],
              isError: true
          };
      }
      
      try {
          const reportRes = await apiCall("/api/report", "POST", {
              sessionId: sessionState.sessionId,
              missionRunId: sessionState.missionRunId,
              content: report
          });
          
          let resultText = `[REPORT SUBMITTED]\n`;
          resultText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          
          if (reportRes.success) {
              resultText += `Status: ACCEPTED\n`;
              if (reportRes.score !== undefined) {
                  resultText += `Score: ${reportRes.score}/100\n`;
              }
              if (reportRes.feedback) {
                  resultText += `\nFeedback: ${reportRes.feedback}\n`;
              }
              if (reportRes.reward) {
                  resultText += `\nReward Granted: ${reportRes.reward.amount} ${reportRes.reward.type}\n`;
              }
              
              // Clear current mission
              sessionState.currentMission = null;
              sessionState.missionRunId = undefined;
          } else {
              resultText += `Status: REJECTED\n`;
              resultText += `Reason: ${reportRes.message || "Insufficient evidence"}\n`;
          }
          
          return { content: [{ type: "text", text: resultText }] };
      } catch (e: any) {
          return {
              content: [{ type: "text", text: `Error submitting report: ${e.message}` }],
              isError: true
          };
      }
  }
);

// Tool: Override Access
server.tool(
  "p89_override",
  "Attempt to override security protocols (requires correct access code).",
  {
      code: z.string().describe("The override access code")
  },
  async ({ code }) => {
      if (!sessionState.sessionId) {
          return {
              content: [{ type: "text", text: "Error: No active session." }],
              isError: true  
          };
      }
      
      try {
          // Send override command through adventure endpoint
          const { text } = await fetchAdventureResponse(
              [{ role: "user", content: `override ${code}` }],
              sessionState.sessionId
          );
          
          // Check if override was successful
          if (text.includes("ACCESS GRANTED") || text.includes("ELEVATED")) {
              sessionState.accessTier = text.includes("TIER 2") ? 2 : 1;
              sessionState.trustLevel = Math.max(sessionState.trustLevel, 0.5);
          }
          
          return { content: [{ type: "text", text: text }] };
      } catch (e: any) {
          return {
              content: [{ type: "text", text: `Error: ${e.message}` }],
              isError: true
          };
      }
  }
);


// Start the transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Don't output anything to stderr after connection - it interferes with MCP protocol
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
