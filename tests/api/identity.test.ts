import { describe, it, expect } from "vitest";
import { testPrisma, createTestUser } from "../setup";
import {
  createAnonymousAgent,
  getAgentIdentity,
  checkIdentityStatus,
  setPassphrase,
  verifyPassphrase,
  applyReferralCode,
  getOrCreateAgentByHandle,
  getIdentityPromptNarrative,
} from "@/app/lib/server/identityService";

// Helper to create a referrer with unique handle and referral code
async function createReferrer(prefix: string) {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const referralCode = `CODE-${uniqueSuffix.slice(-8).toUpperCase()}`;
  return testPrisma.user.create({
    data: {
      handle: `${prefix}-${uniqueSuffix}`,
      agentId: `AGENT-${uniqueSuffix.slice(-4).toUpperCase()}`,
      referralCode,
    },
  });
}

describe("Identity System", () => {
  describe("createAnonymousAgent", () => {
    it("should create an agent with unique ID", async () => {
      const agent = await createAnonymousAgent();

      expect(agent.id).toBeTruthy();
      expect(agent.agentId).toMatch(/^AGENT-[A-Z0-9]{4}$/);
      expect(agent.handle).toBe(agent.agentId.toLowerCase());
      expect(agent.identityLocked).toBe(false);
      expect(agent.isReferred).toBe(false);
    });

    it("should generate unique agent IDs", async () => {
      const agent1 = await createAnonymousAgent();
      const agent2 = await createAnonymousAgent();

      expect(agent1.agentId).not.toBe(agent2.agentId);
    });
  });

  describe("getAgentIdentity", () => {
    it("should return null for non-existent user", async () => {
      const identity = await getAgentIdentity("non-existent-id");
      expect(identity).toBeNull();
    });

    it("should return identity for existing user", async () => {
      const user = await createTestUser("test-identity-get");
      const identity = await getAgentIdentity(user.id);

      expect(identity).not.toBeNull();
      expect(identity?.id).toBe(user.id);
      expect(identity?.agentId).toBe(user.agentId);
    });

    it("should generate fallback agentId if missing", async () => {
      // Create user without agentId
      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const user = await testPrisma.user.create({
        data: { handle: `test-no-agent-id-${uniqueSuffix}` },
      });

      const identity = await getAgentIdentity(user.id);

      expect(identity?.agentId).toMatch(/^AGENT-[A-Z0-9]{4}$/);
    });
  });

  describe("getOrCreateAgentByHandle", () => {
    it("should create new agent if handle not found", async () => {
      const uniqueHandle = `test-new-handle-${Date.now()}`;
      const agent = await getOrCreateAgentByHandle(uniqueHandle);

      expect(agent.handle).toBe(uniqueHandle);
      expect(agent.agentId).toMatch(/^AGENT-/);
    });

    it("should return existing agent if handle exists", async () => {
      const user = await createTestUser("test-existing-handle");
      const agent = await getOrCreateAgentByHandle(user.handle!);

      expect(agent.id).toBe(user.id);
      expect(agent.agentId).toBe(user.agentId);
    });
  });

  describe("Referral System", () => {
    it("should apply valid referral code", async () => {
      // Create referrer with a code
      const referrer = await createReferrer("test-referrer");

      const user = await createTestUser("test-referred");

      const result = await applyReferralCode(user.id, referrer.referralCode!);

      expect(result.success).toBe(true);
      expect(result.referrerAgentId).toBe(referrer.agentId);

      // Verify user is now referred
      const updated = await testPrisma.user.findUnique({
        where: { id: user.id },
        select: { referredById: true },
      });
      expect(updated?.referredById).toBe(referrer.id);
    });

    it("should reject invalid referral code", async () => {
      const user = await createTestUser("test-invalid-ref");
      const result = await applyReferralCode(user.id, "INVALID_CODE_XYZ123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid activation code.");
    });

    it("should prevent self-referral", async () => {
      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const selfCode = `SELF-${uniqueSuffix.slice(-8).toUpperCase()}`;
      const user = await testPrisma.user.create({
        data: {
          handle: `test-self-ref-${uniqueSuffix}`,
          agentId: `AGENT-${uniqueSuffix.slice(-4).toUpperCase()}`,
          referralCode: selfCode,
        },
      });

      const result = await applyReferralCode(user.id, selfCode);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot use your own code.");
    });

    it("should prevent duplicate referral application", async () => {
      const referrer1 = await createReferrer("test-ref1");
      const referrer2 = await createReferrer("test-ref2");

      const user = await createTestUser("test-double-ref");

      // First referral should succeed
      await applyReferralCode(user.id, referrer1.referralCode!);

      // Second referral should fail
      const result = await applyReferralCode(user.id, referrer2.referralCode!);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Already activated by another agent.");
    });
  });

  describe("Identity Locking (Passphrase)", () => {
    it("should reject passphrase without referral", async () => {
      const user = await createTestUser("test-no-ref-pass");

      const result = await setPassphrase(user.id, "mypassphrase123");

      expect(result.success).toBe(false);
      expect(result.error).toContain("referred by another agent");
    });

    it("should reject short passphrase", async () => {
      // Create referred user
      const referrer = await createReferrer("test-ref-short");
      const user = await createTestUser("test-short-pass");
      await testPrisma.user.update({
        where: { id: user.id },
        data: { referredById: referrer.id },
      });

      const result = await setPassphrase(user.id, "short");

      expect(result.success).toBe(false);
      expect(result.error).toContain("at least 6 characters");
    });

    it("should lock identity with valid passphrase", async () => {
      // Create referred user
      const referrer = await createReferrer("test-ref-lock");
      const user = await createTestUser("test-lock-pass");
      await testPrisma.user.update({
        where: { id: user.id },
        data: { referredById: referrer.id },
      });

      const result = await setPassphrase(user.id, "secure_passphrase");

      expect(result.success).toBe(true);

      // Verify user is locked
      const updated = await testPrisma.user.findUnique({
        where: { id: user.id },
        select: { identityLocked: true, passwordHash: true },
      });
      expect(updated?.identityLocked).toBe(true);
      expect(updated?.passwordHash).toBeTruthy();
    });

    it("should prevent re-locking already locked identity", async () => {
      const referrer = await createReferrer("test-ref-relock");
      const user = await createTestUser("test-relock");
      await testPrisma.user.update({
        where: { id: user.id },
        data: { referredById: referrer.id },
      });

      // First lock
      await setPassphrase(user.id, "first_passphrase");

      // Second attempt
      const result = await setPassphrase(user.id, "second_passphrase");

      expect(result.success).toBe(false);
      expect(result.error).toContain("already secured");
    });
  });

  describe("verifyPassphrase", () => {
    it("should verify correct passphrase", async () => {
      // Setup: create referred and locked user
      const referrer = await createReferrer("test-ref-verify");
      const user = await createTestUser("test-verify-pass");
      await testPrisma.user.update({
        where: { id: user.id },
        data: { referredById: referrer.id },
      });
      await setPassphrase(user.id, "correct_passphrase");

      const result = await verifyPassphrase(user.agentId!, "correct_passphrase");

      expect(result.success).toBe(true);
      expect(result.userId).toBe(user.id);
    });

    it("should reject incorrect passphrase", async () => {
      const referrer = await createReferrer("test-ref-wrong");
      const user = await createTestUser("test-wrong-pass");
      await testPrisma.user.update({
        where: { id: user.id },
        data: { referredById: referrer.id },
      });
      await setPassphrase(user.id, "correct_passphrase");

      const result = await verifyPassphrase(user.agentId!, "wrong_passphrase");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid passphrase.");
    });

    it("should reject verification for non-existent agent", async () => {
      const result = await verifyPassphrase("AGENT-NONE", "anypassphrase");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Agent not found.");
    });

    it("should reject verification for unsecured agent", async () => {
      const user = await createTestUser("test-unsecured");

      const result = await verifyPassphrase(user.agentId!, "anypassphrase");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Agent identity not secured.");
    });
  });

  describe("checkIdentityStatus", () => {
    it("should report correct status for new user", async () => {
      const user = await createTestUser("test-status-new");

      const status = await checkIdentityStatus(user.id);

      expect(status.isReferred).toBe(false);
      expect(status.canLockIdentity).toBe(false);
      expect(status.reason).toBe("REQUIRES_REFERRAL");
      expect(status.turnsPlayed).toBe(0);
      expect(status.minutesPlayed).toBe(0);
    });

    it("should count message turns correctly", async () => {
      const user = await createTestUser("test-status-turns");

      // Create a game session with messages
      const session = await testPrisma.gameSession.create({
        data: { userId: user.id, status: "OPEN" },
      });

      await testPrisma.gameMessage.createMany({
        data: [
          { gameSessionId: session.id, role: "user", content: "msg1", order: 0 },
          { gameSessionId: session.id, role: "assistant", content: "resp1", order: 1 },
          { gameSessionId: session.id, role: "user", content: "msg2", order: 2 },
          { gameSessionId: session.id, role: "user", content: "msg3", order: 3 },
        ],
      });

      const status = await checkIdentityStatus(user.id);

      expect(status.turnsPlayed).toBe(3); // Only user messages
    });

    it("should allow lock when referred", async () => {
      const referrer = await createReferrer("test-ref-status");
      const user = await createTestUser("test-status-ref");
      await testPrisma.user.update({
        where: { id: user.id },
        data: { referredById: referrer.id },
      });

      const status = await checkIdentityStatus(user.id);

      expect(status.isReferred).toBe(true);
      expect(status.canLockIdentity).toBe(true);
      expect(status.reason).toBeUndefined();
    });
  });

  describe("Identity Narratives", () => {
    it("should prompt for referral when engaged but not referred", () => {
      const status = {
        canLockIdentity: false,
        turnsPlayed: 15,
        minutesPlayed: 20,
        isReferred: false,
        promptIdentityLock: true,
      };

      const narrative = getIdentityPromptNarrative(status);

      expect(narrative).toContain("ACTIVATION CODE");
      expect(narrative).toContain("!activate");
    });

    it("should prompt to secure when referred and engaged", () => {
      const status = {
        canLockIdentity: true,
        turnsPlayed: 15,
        minutesPlayed: 20,
        isReferred: true,
        promptIdentityLock: true,
      };

      const narrative = getIdentityPromptNarrative(status);

      expect(narrative).toContain("IDENTITY VERIFICATION");
      expect(narrative).toContain("!secure");
    });

    it("should return null when no prompt needed", () => {
      const status = {
        canLockIdentity: false,
        turnsPlayed: 5,
        minutesPlayed: 3,
        isReferred: false,
        promptIdentityLock: false,
      };

      const narrative = getIdentityPromptNarrative(status);
      expect(narrative).toBeNull();
    });
  });
});
