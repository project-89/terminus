
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
// import { config } from "dotenv";
// config(); // Load env vars

// Mock the fetch API for Node environment if needed, or just use native fetch in Node 18+
const BASE_URL = "http://localhost:8889";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// A simple bot player
async function runSimulation() {
  console.log("🤖 STARTING AGENT SIMULATION...");

  const handle = `sim_agent_${Math.floor(Math.random() * 1000)}`;
  console.log(`👤 Identity: ${handle}`);

  // 0. INIT SESSION
  console.log("\n--- STEP 0: INITIALIZING SESSION ---");
  const sessionRes = await fetch(`${BASE_URL}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle, reset: true }),
  });
  const sessionData = await sessionRes.json();
  if (sessionData.error) {
     console.error("❌ Session Init Failed:", sessionData.error);
     return;
  }
  console.log(`✅ Session ID: ${sessionData.sessionId}`);

  // 1. START SESSION (implicitly via adventure or CLI)
  // We'll just hit the mission endpoint directly to simulate a CLI user
  console.log("\n--- STEP 1: FETCHING MISSION ---");
  let missionRes = await fetch(`${BASE_URL}/api/mission?sessionId=${sessionData.sessionId}`);
  let missionData = await missionRes.json();
  console.log("DEBUG: Mission Response:", JSON.stringify(missionData, null, 2));

  if (missionData.message === "No missions available" || !missionData.mission) {
    console.log("⚠️ No missions found. The Director might be sleeping.");
    // Force a mission for testing?
    return;
  }

  const mission = missionData.mission;
  console.log(`📜 Mission Offered: "${mission.title}"`);
  console.log(`   Objective: ${mission.prompt}`);

  // 2. ACCEPT MISSION
  console.log("\n--- STEP 2: ACCEPTING MISSION ---");
  const acceptRes = await fetch(`${BASE_URL}/api/mission`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle, missionId: mission.id }),
  });
  const acceptData = await acceptRes.json();
  
  if (!acceptData.missionRun) {
    console.error("❌ Failed to accept mission:", acceptData);
    return;
  }
  const runId = acceptData.missionRun.id;
  console.log(`✅ Mission Accepted. Run ID: ${runId}`);

  // 3. PERFORM TASK (Simulate passing time)
  console.log("\n--- STEP 3: EXECUTING OPS (Simulated Wait) ---");
  await sleep(2000);

  // 4. SUBMIT REPORT
  // We construct a report that specifically answers the prompt to test the AI Adjudicator
  const reportContent = `MISSION REPORT: Target identified. I have observed the pattern requested in "${mission.title}". 
  Evidence gathered: 
  1. Hex code 0x45 found in the lower quadrant.
  2. Signal frequency matched the objective.
  The lattice is stable. Requesting debrief.`;

  console.log("\n--- STEP 4: SUBMITTING REPORT ---");
  console.log(`📝 Payload: "${reportContent}"`);

  const reportRes = await fetch(`${BASE_URL}/api/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
        handle, 
        missionRunId: runId,
        content: reportContent 
    }),
  });

  const reportData = await reportRes.json();

  if (reportData.error) {
      console.error("❌ Report Failed:", reportData.error);
      return;
  }

  console.log("\n--- STEP 5: ADJUDICATION RESULT ---");
  console.log(`⚖️  Status: ${reportData.status}`);
  console.log(`💯 Score:  ${reportData.score}`);
  console.log(`💬 Feedback: "${reportData.feedback}"`);
  
  if (reportData.reward) {
      console.log(`💰 Reward: ${reportData.reward.amount} ${reportData.reward.type}`);
  } else {
      console.log("⚠️ No reward granted.");
  }

  // 5. CHECK BALANCE (Redeem check)
  console.log("\n--- STEP 6: CHECKING WALLET ---");
  const rewardRes = await fetch(`${BASE_URL}/api/rewards?userId=${reportData.userId || handle /* fixme: api expects userId, we might need to fetch it first */}`);
  // Note: Our API expects userId (UUID), but our CLI commands often use handle or rely on session.
  // The reportData usually returns the full object. Let's check if userId is in there.
  // Actually reportData is MissionRunRecord. It might not have userId on the top level in the response type unless we added it.
  // But wait, the Sim is running against localhost. 
  
  console.log("✅ Simulation Complete.");
}

runSimulation().catch(console.error);
