import { describe, it, expect, beforeEach } from "vitest";
import { testPrisma, createTestUser } from "../setup";
import {
  createAnonymousAgent,
  getAgentIdentity,
  setPassphrase,
  verifyPassphrase,
  applyReferralCode,
  checkIdentityStatus,
} from "@/app/lib/server/identityService";

/**
 * Authentication Flow Tests
 *
 * Tests the complete auth lifecycle:
 * 1. Anonymous agent creation
 * 2. Referral activation
 * 3. Passphrase setting (identity lock)
 * 4. Login verification
 */

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

describe("Authentication Flow", () => {
  describe("Complete Auth Lifecycle", () => {
    it("should complete full auth flow: create → activate → secure → login", async () => {
      // Step 1: Create anonymous agent
      const agent = await createAnonymousAgent();
      expect(agent.id).toBeTruthy();
      expect(agent.agentId).toMatch(/^AGENT-[A-Z0-9]{4}$/);
      expect(agent.identityLocked).toBe(false);
      expect(agent.isReferred).toBe(false);

      // Step 2: Apply referral code
      const referrer = await createReferrer("auth-test-referrer");
      const activationResult = await applyReferralCode(agent.id, referrer.referralCode!);
      expect(activationResult.success).toBe(true);

      // Verify referred status
      const statusAfterActivation = await checkIdentityStatus(agent.id);
      expect(statusAfterActivation.isReferred).toBe(true);
      expect(statusAfterActivation.canLockIdentity).toBe(true);

      // Step 3: Set passphrase to lock identity
      const passphrase = "secure_test_passphrase_123";
      const secureResult = await setPassphrase(agent.id, passphrase);
      expect(secureResult.success).toBe(true);

      // Verify locked status
      const lockedAgent = await getAgentIdentity(agent.id);
      expect(lockedAgent?.identityLocked).toBe(true);

      // Step 4: Login with passphrase
      const loginResult = await verifyPassphrase(agent.agentId!, passphrase);
      expect(loginResult.success).toBe(true);
      expect(loginResult.userId).toBe(agent.id);
    });

    it("should reject login for unactivated agents", async () => {
      const agent = await createAnonymousAgent();

      // Try to login without activation/securing
      const result = await verifyPassphrase(agent.agentId!, "anypassphrase");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Agent identity not secured.");
    });

    it("should reject securing without activation", async () => {
      const agent = await createAnonymousAgent();

      // Try to secure without referral activation
      const result = await setPassphrase(agent.id, "test_passphrase");

      expect(result.success).toBe(false);
      expect(result.error).toContain("referred by another agent");
    });
  });

  describe("Login Verification", () => {
    let securedAgent: { id: string; agentId: string };
    const testPassphrase = "correct_passphrase_123";

    beforeEach(async () => {
      // Create and secure an agent for login tests
      const agent = await createAnonymousAgent();
      const referrer = await createReferrer("login-test-ref");
      await applyReferralCode(agent.id, referrer.referralCode!);
      await setPassphrase(agent.id, testPassphrase);
      securedAgent = { id: agent.id, agentId: agent.agentId! };
    });

    it("should accept correct passphrase", async () => {
      const result = await verifyPassphrase(securedAgent.agentId, testPassphrase);

      expect(result.success).toBe(true);
      expect(result.userId).toBe(securedAgent.id);
    });

    it("should reject incorrect passphrase", async () => {
      const result = await verifyPassphrase(securedAgent.agentId, "wrong_passphrase");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid passphrase.");
    });

    it("should reject empty passphrase", async () => {
      const result = await verifyPassphrase(securedAgent.agentId, "");

      expect(result.success).toBe(false);
    });

    it("should handle case-sensitive passphrases", async () => {
      const result = await verifyPassphrase(securedAgent.agentId, testPassphrase.toUpperCase());

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid passphrase.");
    });

    it("should reject non-existent agent", async () => {
      const result = await verifyPassphrase("AGENT-NONE", "anypassphrase");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Agent not found.");
    });
  });

  describe("Identity Status Checks", () => {
    it("should report correct status progression", async () => {
      const agent = await createAnonymousAgent();

      // Initial status: new agent
      let status = await checkIdentityStatus(agent.id);
      expect(status.isReferred).toBe(false);
      expect(status.canLockIdentity).toBe(false);
      expect(status.reason).toBe("REQUIRES_REFERRAL");

      // After activation
      const referrer = await createReferrer("status-test-ref");
      await applyReferralCode(agent.id, referrer.referralCode!);

      status = await checkIdentityStatus(agent.id);
      expect(status.isReferred).toBe(true);
      expect(status.canLockIdentity).toBe(true);
      expect(status.reason).toBeUndefined();

      // After securing
      await setPassphrase(agent.id, "test_passphrase");

      const identity = await getAgentIdentity(agent.id);
      expect(identity?.identityLocked).toBe(true);
    });
  });

  describe("Agent ID Uniqueness", () => {
    it("should generate unique agent IDs", async () => {
      const agents = await Promise.all([
        createAnonymousAgent(),
        createAnonymousAgent(),
        createAnonymousAgent(),
        createAnonymousAgent(),
        createAnonymousAgent(),
      ]);

      const agentIds = agents.map(a => a.agentId);
      const uniqueIds = new Set(agentIds);

      expect(uniqueIds.size).toBe(agents.length);
    });

    it("should match expected agentId format", async () => {
      const agent = await createAnonymousAgent();

      // Format: AGENT-XXXX where X is alphanumeric (excluding ambiguous chars)
      expect(agent.agentId).toMatch(/^AGENT-[0-9A-HJ-NP-Z]{4}$/);
    });
  });

  describe("Passphrase Security", () => {
    it("should reject passphrases shorter than 6 characters", async () => {
      const agent = await createAnonymousAgent();
      const referrer = await createReferrer("short-pass-ref");
      await applyReferralCode(agent.id, referrer.referralCode!);

      const result = await setPassphrase(agent.id, "12345");

      expect(result.success).toBe(false);
      expect(result.error).toContain("at least 6 characters");
    });

    it("should accept passphrases of exactly 6 characters", async () => {
      const agent = await createAnonymousAgent();
      const referrer = await createReferrer("six-char-ref");
      await applyReferralCode(agent.id, referrer.referralCode!);

      const result = await setPassphrase(agent.id, "123456");

      expect(result.success).toBe(true);
    });

    it("should hash passphrases (not store plaintext)", async () => {
      const agent = await createAnonymousAgent();
      const referrer = await createReferrer("hash-test-ref");
      await applyReferralCode(agent.id, referrer.referralCode!);

      const passphrase = "my_secret_passphrase";
      await setPassphrase(agent.id, passphrase);

      // Check database directly
      const dbUser = await testPrisma.user.findUnique({
        where: { id: agent.id },
        select: { passwordHash: true },
      });

      expect(dbUser?.passwordHash).toBeTruthy();
      expect(dbUser?.passwordHash).not.toBe(passphrase);
      expect(dbUser?.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt prefix
    });
  });

  describe("Identity Locking", () => {
    it("should lock identity after setting passphrase", async () => {
      const agent = await createAnonymousAgent();
      const referrer = await createReferrer("lock-test-ref");
      await applyReferralCode(agent.id, referrer.referralCode!);
      await setPassphrase(agent.id, "test_passphrase");

      const identity = await getAgentIdentity(agent.id);

      expect(identity?.identityLocked).toBe(true);
      expect(identity?.isReferred).toBe(true);
    });

    it("should prevent re-locking already locked identity", async () => {
      const agent = await createAnonymousAgent();
      const referrer = await createReferrer("relock-test-ref");
      await applyReferralCode(agent.id, referrer.referralCode!);
      await setPassphrase(agent.id, "test_passphrase");

      // Try to set passphrase again
      const result = await setPassphrase(agent.id, "new_passphrase");

      expect(result.success).toBe(false);
      expect(result.error).toContain("already secured");
    });
  });
});
