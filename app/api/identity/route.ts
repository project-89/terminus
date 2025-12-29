import { NextRequest, NextResponse } from "next/server";
import {
  createAnonymousAgent,
  getAgentIdentity,
  checkIdentityStatus,
  setPassphrase,
  verifyPassphrase,
  applyReferralCode,
  getOrCreateAgentByHandle,
  getIdentityPromptNarrative,
  getActivationSuccessNarrative,
  getSecureSuccessNarrative,
} from "@/app/lib/server/identityService";
import { generateReferralCode } from "@/app/lib/server/referralService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const handle = searchParams.get("handle");
  
  if (!userId && !handle) {
    return NextResponse.json({ error: "userId or handle required" }, { status: 400 });
  }
  
  try {
    let identity;
    
    if (userId) {
      identity = await getAgentIdentity(userId);
    } else if (handle) {
      identity = await getOrCreateAgentByHandle(handle);
    }
    
    if (!identity) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    
    const status = await checkIdentityStatus(identity.id);
    const narrative = getIdentityPromptNarrative(status);
    
    return NextResponse.json({
      identity,
      status,
      narrative,
    });
  } catch (error) {
    console.error("Identity GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    
    switch (action) {
      case "create": {
        const identity = await createAnonymousAgent();
        const referralCode = await generateReferralCode(identity.id);
        return NextResponse.json({
          identity: { ...identity, referralCode },
          message: `Welcome, ${identity.agentId}. Your signal has been detected.`,
        });
      }
      
      case "activate": {
        const { userId, code } = body;
        if (!userId || !code) {
          return NextResponse.json({ error: "userId and code required" }, { status: 400 });
        }
        
        const result = await applyReferralCode(userId, code);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        
        return NextResponse.json({
          success: true,
          narrative: getActivationSuccessNarrative(result.referrerAgentId),
        });
      }
      
      case "secure": {
        const { userId, passphrase } = body;
        if (!userId || !passphrase) {
          return NextResponse.json({ error: "userId and passphrase required" }, { status: 400 });
        }
        
        const identity = await getAgentIdentity(userId);
        if (!identity) {
          return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }
        
        const result = await setPassphrase(userId, passphrase);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        
        const referralCode = await generateReferralCode(userId);
        
        return NextResponse.json({
          success: true,
          referralCode,
          narrative: getSecureSuccessNarrative(identity.agentId),
        });
      }
      
      case "login": {
        const { agentId, passphrase } = body;
        if (!agentId || !passphrase) {
          return NextResponse.json({ error: "agentId and passphrase required" }, { status: 400 });
        }
        
        const result = await verifyPassphrase(agentId, passphrase);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 401 });
        }
        
        const identity = await getAgentIdentity(result.userId!);
        
        return NextResponse.json({
          success: true,
          identity,
          message: `Welcome back, ${identity?.agentId}. The Pattern remembers.`,
        });
      }
      
      case "check": {
        const { userId } = body;
        if (!userId) {
          return NextResponse.json({ error: "userId required" }, { status: 400 });
        }
        
        const status = await checkIdentityStatus(userId);
        const narrative = getIdentityPromptNarrative(status);
        
        return NextResponse.json({ status, narrative });
      }
      
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Identity POST error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
