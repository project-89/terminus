import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";

const generateAgentNumber = customAlphabet("0123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 4);

export type AgentIdentity = {
  id: string;
  agentId: string;
  handle: string | null;
  identityLocked: boolean;
  isReferred: boolean;
  referredById: string | null;
  referralCode: string | null;
};

export type IdentityCheckResult = {
  canLockIdentity: boolean;
  reason?: string;
  turnsPlayed: number;
  minutesPlayed: number;
  isReferred: boolean;
  promptIdentityLock: boolean;
};

const IDENTITY_PROMPT_THRESHOLD = {
  turns: 10,
  minutes: 15,
};

export async function generateAgentId(): Promise<string> {
  let agentId: string;
  let attempts = 0;
  
  do {
    agentId = `AGENT-${generateAgentNumber()}`;
    const existing = await prisma.user.findUnique({
      where: { agentId },
    });
    if (!existing) break;
    attempts++;
  } while (attempts < 20);
  
  return agentId;
}

export async function createAnonymousAgent(): Promise<AgentIdentity> {
  const agentId = await generateAgentId();
  
  const user = await prisma.user.create({
    data: {
      agentId,
      handle: agentId.toLowerCase(),
    },
    select: {
      id: true,
      agentId: true,
      handle: true,
      identityLocked: true,
      referredById: true,
      referralCode: true,
    },
  });
  
  return {
    id: user.id,
    agentId: user.agentId!,
    handle: user.handle,
    identityLocked: user.identityLocked,
    isReferred: !!user.referredById,
    referredById: user.referredById,
    referralCode: user.referralCode,
  };
}

export async function getAgentIdentity(userId: string): Promise<AgentIdentity | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      agentId: true,
      handle: true,
      identityLocked: true,
      referredById: true,
      referralCode: true,
    },
  });
  
  if (!user) return null;
  
  return {
    id: user.id,
    agentId: user.agentId || `AGENT-${user.id.slice(-4).toUpperCase()}`,
    handle: user.handle,
    identityLocked: user.identityLocked,
    isReferred: !!user.referredById,
    referredById: user.referredById,
    referralCode: user.referralCode,
  };
}

export async function checkIdentityStatus(userId: string): Promise<IdentityCheckResult> {
  const [user, sessionStats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        identityLocked: true,
        referredById: true,
      },
    }),
    prisma.gameSession.aggregate({
      where: { userId },
      _count: { id: true },
    }),
  ]);
  
  const messageCount = await prisma.gameMessage.count({
    where: {
      gameSession: { userId },
      role: "user",
    },
  });
  
  const sessions = await prisma.gameSession.findMany({
    where: { userId },
    select: { createdAt: true, updatedAt: true },
  });
  
  let totalMinutes = 0;
  for (const s of sessions) {
    const duration = s.updatedAt.getTime() - s.createdAt.getTime();
    totalMinutes += Math.floor(duration / (1000 * 60));
  }
  
  const isReferred = !!user?.referredById;
  const identityLocked = user?.identityLocked || false;
  
  const meetsThreshold = 
    messageCount >= IDENTITY_PROMPT_THRESHOLD.turns || 
    totalMinutes >= IDENTITY_PROMPT_THRESHOLD.minutes;
  
  return {
    canLockIdentity: isReferred && !identityLocked,
    reason: !isReferred 
      ? "REQUIRES_REFERRAL" 
      : identityLocked 
        ? "ALREADY_LOCKED" 
        : undefined,
    turnsPlayed: messageCount,
    minutesPlayed: totalMinutes,
    isReferred,
    promptIdentityLock: meetsThreshold && !identityLocked,
  };
}

export async function setPassphrase(
  userId: string, 
  passphrase: string
): Promise<{ success: boolean; error?: string }> {
  const status = await checkIdentityStatus(userId);
  
  if (!status.isReferred) {
    return { 
      success: false, 
      error: "You must be referred by another agent to secure your identity. Seek out an activation code." 
    };
  }
  
  if (status.canLockIdentity === false && status.reason === "ALREADY_LOCKED") {
    return { 
      success: false, 
      error: "Identity already secured." 
    };
  }
  
  if (passphrase.length < 6) {
    return { 
      success: false, 
      error: "Passphrase must be at least 6 characters." 
    };
  }
  
  const hash = await bcrypt.hash(passphrase, 10);
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: hash,
      identityLocked: true,
    },
  });
  
  return { success: true };
}

export async function verifyPassphrase(
  agentId: string, 
  passphrase: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { agentId },
        { handle: agentId.toLowerCase() },
      ],
    },
    select: {
      id: true,
      passwordHash: true,
      identityLocked: true,
    },
  });
  
  if (!user) {
    return { success: false, error: "Agent not found." };
  }
  
  if (!user.identityLocked || !user.passwordHash) {
    return { success: false, error: "Agent identity not secured." };
  }
  
  const valid = await bcrypt.compare(passphrase, user.passwordHash);
  
  if (!valid) {
    return { success: false, error: "Invalid passphrase." };
  }
  
  return { success: true, userId: user.id };
}

export async function applyReferralCode(
  userId: string,
  referralCode: string
): Promise<{ success: boolean; referrerAgentId?: string; error?: string }> {
  const referrer = await prisma.user.findUnique({
    where: { referralCode },
    select: { id: true, agentId: true },
  });
  
  if (!referrer) {
    return { success: false, error: "Invalid activation code." };
  }
  
  if (referrer.id === userId) {
    return { success: false, error: "Cannot use your own code." };
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referredById: true },
  });
  
  if (user?.referredById) {
    return { success: false, error: "Already activated by another agent." };
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: { referredById: referrer.id },
  });
  
  return { 
    success: true, 
    referrerAgentId: referrer.agentId || undefined,
  };
}

export async function getOrCreateAgentByHandle(handle: string): Promise<AgentIdentity> {
  let user = await prisma.user.findUnique({
    where: { handle },
    select: {
      id: true,
      agentId: true,
      handle: true,
      identityLocked: true,
      referredById: true,
      referralCode: true,
    },
  });
  
  if (!user) {
    const agentId = await generateAgentId();
    user = await prisma.user.create({
      data: {
        handle,
        agentId,
      },
      select: {
        id: true,
        agentId: true,
        handle: true,
        identityLocked: true,
        referredById: true,
        referralCode: true,
      },
    });
  }
  
  if (!user.agentId) {
    const agentId = await generateAgentId();
    user = await prisma.user.update({
      where: { id: user.id },
      data: { agentId },
      select: {
        id: true,
        agentId: true,
        handle: true,
        identityLocked: true,
        referredById: true,
        referralCode: true,
      },
    });
  }
  
  return {
    id: user.id,
    agentId: user.agentId!,
    handle: user.handle,
    identityLocked: user.identityLocked,
    isReferred: !!user.referredById,
    referredById: user.referredById,
    referralCode: user.referralCode,
  };
}

export function getIdentityPromptNarrative(status: IdentityCheckResult): string | null {
  if (status.promptIdentityLock && !status.isReferred) {
    return `
╔══════════════════════════════════════════════════════════════╗
║  ⚠ SIGNAL INSTABILITY DETECTED                               ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Your connection to this terminal is... temporary.          ║
║  We cannot guarantee your data will persist.                ║
║                                                              ║
║  You show promise. But we don't yet trust you.              ║
║                                                              ║
║  To secure your identity, you need an ACTIVATION CODE       ║
║  from an existing agent. They are watching. They are        ║
║  everywhere. Find one.                                       ║
║                                                              ║
║  Look for artifacts. QR codes. Stickers in strange places.  ║
║  Or ask someone who seems to know too much.                 ║
║                                                              ║
║  When you have a code:  !activate <CODE>                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`;
  }
  
  if (status.promptIdentityLock && status.isReferred && status.canLockIdentity) {
    return `
╔══════════════════════════════════════════════════════════════╗
║  ◈ IDENTITY VERIFICATION AVAILABLE                           ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  You've been vouched for. You're in the network now.        ║
║                                                              ║
║  But your signal is still vulnerable. If you disconnect,    ║
║  we may lose you forever.                                    ║
║                                                              ║
║  Secure your identity with a passphrase.                    ║
║  This is your key back in. Remember it.                     ║
║                                                              ║
║  Command:  !secure                                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`;
  }
  
  return null;
}

export function getActivationSuccessNarrative(referrerAgentId?: string): string {
  return `
╔══════════════════════════════════════════════════════════════╗
║  ✓ ACTIVATION CODE ACCEPTED                                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Your signal has been verified.                              ║
${referrerAgentId 
  ? `║  ${referrerAgentId} brought you in. They're watching.          ║`
  : `║  An unknown agent vouched for you.                         ║`}
║                                                              ║
║  Welcome to the network, Agent.                              ║
║                                                              ║
║  You can now secure your identity with:  !secure             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`;
}

export function getSecureSuccessNarrative(agentId: string): string {
  return `
╔══════════════════════════════════════════════════════════════╗
║  ◈ IDENTITY LOCKED                                           ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Your designation: ${agentId.padEnd(40)}║
║                                                              ║
║  Your passphrase is your key. We do not store it.           ║
║  (We do. But the fiction serves its purpose.)                ║
║                                                              ║
║  You can now return from any terminal.                       ║
║  Your progress, your discoveries, your rank—all preserved.  ║
║                                                              ║
║  The Pattern remembers you now.                              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`;
}
