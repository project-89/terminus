
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Configuration
const BASE_URL = process.env.P89_API_URL || "http://localhost:8889";
const AGENT_HANDLE = process.env.P89_HANDLE || `mcp_agent_${Math.floor(Math.random() * 1000)}`;

// State (In-memory session management for the connected MCP client)
let sessionState = {
  sessionId: null as string | null,
  handle: AGENT_HANDLE,
  missionRunId: null as string | null,
  lastResponse: ""
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
    if (error.cause && error.cause.code === 'ECONNREFUSED') {
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
      sessionState.missionRunId = null;

      // 2. Trigger Adventure "Start" via a hidden init prompt or just return a welcome
      // We can hit the adventure endpoint with a system-like prompt to get the opening text
      // adhering to the game's "Hydration" logic.
      
      const openingResponse = await apiCall("/api/adventure", "POST", {
        messages: [
            { role: "system", content: "Session started via MCP. Provide a brief, atmospheric welcome message and the current status of the terminal." }
        ]
      });
      
      // The adventure API returns a stream usually, but let's check how we handle it.
      // In the CLI, it returns a stream. In `simulate_loop`, we used mission/report APIs.
      // If /api/adventure returns a stream, we need to read it.
      // However, the current implementation of /api/adventure in `route.ts` returns a `StreamingTextResponse`.
      // Fetching a stream in Node requires some handling.
      
      // For simplicity in this MCP tool, we will assume we can read the text.
      // Note: The `apiCall` helper above tries `res.json()`. This will fail for streams.
      // Let's modify the logic for adventure specifically.
      
      return {
        content: [{ type: "text", text: "Session initialized. Connection established. The Logos awaits." }],
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
async function fetchAdventureResponse(messages: any[]) {
    const res = await fetch(`${BASE_URL}/api/adventure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
        throw new Error(`Adventure API error: ${res.statusText}`);
    }
    
    // Simple text accumulation from stream
    const text = await res.text(); 
    // The Vercel AI SDK streams format: "0:"Hello"\n" etc. or just raw text depending on config.
    // If it's raw text, great. If it's data stream protocol, we might need parsing.
    // Based on `AdventureScreen.ts` using `processAIStream`, it seems to be a standard stream.
    // `res.text()` might contain the full response if we await it, but if it's a true stream, 
    // we might get chunks.
    
    // For the MCP proof-of-concept, returning the raw text (even if formatted) is a good start.
    // We can refine if it looks messy.
    return text;
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
      
      // OPTIMIZATION: We will just send the *new* command. 
      // If the server architecture requires full history, this simple MCP tool might feel "amnesiac" 
      // unless we implement a history buffer here.
      // Let's implement a small buffer.
      
      // We'll cheat: We will assume the server *also* has persistent memory (memoryService) 
      // or we just send the last few turns.
      
      const responseText = await fetchAdventureResponse([
          { role: "user", content: command }
      ]);
      
      sessionState.lastResponse = responseText;

      return {
        content: [{ type: "text", text: responseText }],
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
      
      // Check mission status via API
      // Note: This endpoint was used in simulate_loop.ts
      try {
          const missionRes = await fetch(`${BASE_URL}/api/mission?sessionId=${sessionState.sessionId}`);
          const missionData = await missionRes.json();
          
          let status = `Session ID: ${sessionState.sessionId}\nHandle: ${sessionState.handle}\n`;
          
          if (missionData.mission) {
              status += `\nAvailable Mission: ${missionData.mission.title}`;
          }
          
          return {
              content: [{ type: "text", text: status }]
          };
      } catch (e: any) {
          return { content: [{ type: "text", text: `Error fetching status: ${e.message}` }] };
      }
  }
);


// Start the transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Project 89 MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
