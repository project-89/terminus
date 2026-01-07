import { describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/identity/route";
import { testPrisma } from "../setup";

/**
 * Identity API Route Tests
 *
 * Tests the /api/identity endpoint:
 * - GET: Retrieve identity by userId or handle
 * - POST actions: create, activate, secure, login, check
 */

// Helper to create a mock NextRequest
function createRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>
): Request {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return new Request(url, options);
}

// Helper to create a referrer with a referral code
async function createReferrer(prefix: string) {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const agentSuffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const referralCode = `CODE-${uniqueSuffix.slice(-8).toUpperCase()}`;
  return testPrisma.user.create({
    data: {
      handle: `${prefix}-${uniqueSuffix}`,
      agentId: `REF-${agentSuffix}`,
      referralCode,
    },
  });
}

describe("Identity API Routes", () => {
  describe("POST /api/identity - create", () => {
    it("should create a new anonymous agent", async () => {
      const req = createRequest("POST", "http://localhost/api/identity", {
        action: "create",
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.identity).toBeDefined();
      expect(data.identity.agentId).toMatch(/^AGENT-[A-Z0-9]{4}$/);
      expect(data.identity.identityLocked).toBe(false);
      expect(data.message).toContain("Welcome");
    });

    it("should generate a referral code on creation", async () => {
      const req = createRequest("POST", "http://localhost/api/identity", {
        action: "create",
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(data.identity.referralCode).toBeTruthy();
    });
  });

  describe("POST /api/identity - activate", () => {
    it("should activate agent with valid referral code", async () => {
      // Create agent
      const createReq = createRequest("POST", "http://localhost/api/identity", {
        action: "create",
      });
      const createRes = await POST(createReq as any);
      const { identity } = await createRes.json();

      // Create referrer
      const referrer = await createReferrer("api-referrer");

      // Activate
      const activateReq = createRequest("POST", "http://localhost/api/identity", {
        action: "activate",
        userId: identity.id,
        code: referrer.referralCode,
      });

      const response = await POST(activateReq as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.narrative).toBeTruthy();
    });

    it("should reject invalid referral code", async () => {
      const createReq = createRequest("POST", "http://localhost/api/identity", {
        action: "create",
      });
      const createRes = await POST(createReq as any);
      const { identity } = await createRes.json();

      const activateReq = createRequest("POST", "http://localhost/api/identity", {
        action: "activate",
        userId: identity.id,
        code: "INVALID-CODE",
      });

      const response = await POST(activateReq as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Invalid");
    });

    it("should require userId and code", async () => {
      const req = createRequest("POST", "http://localhost/api/identity", {
        action: "activate",
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("required");
    });
  });

  describe("POST /api/identity - secure", () => {
    it("should secure identity with passphrase after activation", async () => {
      // Create agent
      const createReq = createRequest("POST", "http://localhost/api/identity", {
        action: "create",
      });
      const createRes = await POST(createReq as any);
      const { identity } = await createRes.json();

      // Activate
      const referrer = await createReferrer("secure-referrer");
      const activateReq = createRequest("POST", "http://localhost/api/identity", {
        action: "activate",
        userId: identity.id,
        code: referrer.referralCode,
      });
      await POST(activateReq as any);

      // Secure
      const secureReq = createRequest("POST", "http://localhost/api/identity", {
        action: "secure",
        userId: identity.id,
        passphrase: "test_passphrase_123",
      });

      const response = await POST(secureReq as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.referralCode).toBeTruthy();
      expect(data.narrative).toBeTruthy();
    });

    it("should reject securing without activation", async () => {
      const createReq = createRequest("POST", "http://localhost/api/identity", {
        action: "create",
      });
      const createRes = await POST(createReq as any);
      const { identity } = await createRes.json();

      const secureReq = createRequest("POST", "http://localhost/api/identity", {
        action: "secure",
        userId: identity.id,
        passphrase: "test_passphrase",
      });

      const response = await POST(secureReq as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("referred");
    });

    it("should reject short passphrases", async () => {
      // Create and activate
      const createReq = createRequest("POST", "http://localhost/api/identity", {
        action: "create",
      });
      const createRes = await POST(createReq as any);
      const { identity } = await createRes.json();

      const referrer = await createReferrer("short-pass-ref");
      await POST(
        createRequest("POST", "http://localhost/api/identity", {
          action: "activate",
          userId: identity.id,
          code: referrer.referralCode,
        }) as any
      );

      // Try short passphrase
      const secureReq = createRequest("POST", "http://localhost/api/identity", {
        action: "secure",
        userId: identity.id,
        passphrase: "12345",
      });

      const response = await POST(secureReq as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("6 characters");
    });
  });

  describe("POST /api/identity - login", () => {
    let securedAgent: { id: string; agentId: string };
    const testPassphrase = "login_test_pass_123";

    beforeEach(async () => {
      // Create, activate, and secure an agent
      const createRes = await POST(
        createRequest("POST", "http://localhost/api/identity", {
          action: "create",
        }) as any
      );
      const { identity } = await createRes.json();

      const referrer = await createReferrer("login-ref");
      await POST(
        createRequest("POST", "http://localhost/api/identity", {
          action: "activate",
          userId: identity.id,
          code: referrer.referralCode,
        }) as any
      );

      await POST(
        createRequest("POST", "http://localhost/api/identity", {
          action: "secure",
          userId: identity.id,
          passphrase: testPassphrase,
        }) as any
      );

      securedAgent = { id: identity.id, agentId: identity.agentId };
    });

    it("should login with correct passphrase", async () => {
      const loginReq = createRequest("POST", "http://localhost/api/identity", {
        action: "login",
        agentId: securedAgent.agentId,
        passphrase: testPassphrase,
      });

      const response = await POST(loginReq as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.identity).toBeDefined();
      expect(data.identity.id).toBe(securedAgent.id);
      expect(data.message).toContain("Welcome back");
    });

    it("should reject incorrect passphrase", async () => {
      const loginReq = createRequest("POST", "http://localhost/api/identity", {
        action: "login",
        agentId: securedAgent.agentId,
        passphrase: "wrong_passphrase",
      });

      const response = await POST(loginReq as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain("Invalid");
    });

    it("should reject non-existent agent", async () => {
      const loginReq = createRequest("POST", "http://localhost/api/identity", {
        action: "login",
        agentId: "AGENT-FAKE",
        passphrase: "anypassphrase",
      });

      const response = await POST(loginReq as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain("not found");
    });
  });

  describe("POST /api/identity - check", () => {
    it("should return identity status", async () => {
      const createRes = await POST(
        createRequest("POST", "http://localhost/api/identity", {
          action: "create",
        }) as any
      );
      const { identity } = await createRes.json();

      const checkReq = createRequest("POST", "http://localhost/api/identity", {
        action: "check",
        userId: identity.id,
      });

      const response = await POST(checkReq as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBeDefined();
      expect(data.status.isReferred).toBe(false);
      expect(data.status.canLockIdentity).toBe(false);
    });
  });

  describe("GET /api/identity", () => {
    it("should retrieve identity by userId", async () => {
      const createRes = await POST(
        createRequest("POST", "http://localhost/api/identity", {
          action: "create",
        }) as any
      );
      const { identity } = await createRes.json();

      const getReq = createRequest(
        "GET",
        `http://localhost/api/identity?userId=${identity.id}`
      );

      const response = await GET(getReq as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.identity.id).toBe(identity.id);
      expect(data.identity.agentId).toBe(identity.agentId);
      expect(data.status).toBeDefined();
    });

    it("should retrieve or create identity by handle", async () => {
      const uniqueHandle = `handle-${Date.now()}`;
      const getReq = createRequest(
        "GET",
        `http://localhost/api/identity?handle=${uniqueHandle}`
      );

      const response = await GET(getReq as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.identity).toBeDefined();
      expect(data.identity.handle).toBe(uniqueHandle);
    });

    it("should return 400 without userId or handle", async () => {
      const getReq = createRequest("GET", "http://localhost/api/identity");

      const response = await GET(getReq as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("required");
    });
  });

  describe("POST /api/identity - unknown action", () => {
    it("should return error for unknown action", async () => {
      const req = createRequest("POST", "http://localhost/api/identity", {
        action: "unknown",
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Unknown action");
    });
  });
});
