import { beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";

// Create a test Prisma client (uses same db as dev for integration tests)
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://parzival@localhost:5432/p89_db?schema=public",
    },
  },
});

// Test utilities
export async function createTestUser(handlePrefix?: string) {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const id = `test-user-${uniqueSuffix}`;
  // Use more random characters to avoid collisions
  const agentId = `TST-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  // Always make handle unique to avoid conflicts in parallel tests
  const handle = handlePrefix ? `${handlePrefix}-${uniqueSuffix}` : `test-${uniqueSuffix}`;

  return testPrisma.user.create({
    data: {
      id,
      handle,
      agentId,
    },
  });
}

export async function createTestSession(userId: string) {
  const token = `test-token-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return testPrisma.session.create({
    data: {
      userId,
      token,
    },
  });
}

// Cleanup helpers - gracefully handle FK constraints
export async function cleanupTestData() {
  try {
    const testUsers = await testPrisma.user.findMany({
      where: { handle: { startsWith: "test-" } },
      select: { id: true },
    });
    const testUserIds = testUsers.map((u) => u.id);

    if (testUserIds.length === 0) return;

    // Try to delete test data, ignoring FK errors
    const deleteOps = [
      testPrisma.experimentEvent.deleteMany({ where: { experiment: { userId: { in: testUserIds } } } }),
      testPrisma.experiment.deleteMany({ where: { userId: { in: testUserIds } } }),
      testPrisma.reward.deleteMany({ where: { userId: { in: testUserIds } } }),
      testPrisma.missionRun.deleteMany({ where: { userId: { in: testUserIds } } }),
      testPrisma.gameMessage.deleteMany({ where: { gameSession: { userId: { in: testUserIds } } } }),
      testPrisma.gameSession.deleteMany({ where: { userId: { in: testUserIds } } }),
      testPrisma.message.deleteMany({ where: { thread: { userId: { in: testUserIds } } } }),
      testPrisma.thread.deleteMany({ where: { userId: { in: testUserIds } } }),
      testPrisma.session.deleteMany({ where: { userId: { in: testUserIds } } }),
      testPrisma.playerProfile.deleteMany({ where: { userId: { in: testUserIds } } }),
      testPrisma.agentNote.deleteMany({ where: { userId: { in: testUserIds } } }),
      testPrisma.memoryEvent.deleteMany({ where: { userId: { in: testUserIds } } }),
      testPrisma.memoryEmbedding.deleteMany({ where: { userId: { in: testUserIds } } }),
    ];

    // Execute all deletes, catching individual errors
    await Promise.allSettled(deleteOps);

    // Try to delete users last
    await testPrisma.user.deleteMany({ where: { id: { in: testUserIds } } }).catch(() => {});
  } catch (e) {
    // Ignore cleanup errors - tests may have created data with complex FK relationships
    console.warn("Cleanup warning:", (e as Error).message?.slice(0, 100));
  }
}

// Global setup
beforeAll(async () => {
  // Verify database connection
  try {
    await testPrisma.$connect();
    console.log("Connected to test database");
  } catch (error) {
    console.error("Failed to connect to test database:", error);
    throw error;
  }
});

beforeEach(async () => {
  // Clean up before each test for isolation
  await cleanupTestData();
});

afterAll(async () => {
  // Final cleanup and disconnect
  await cleanupTestData();
  await testPrisma.$disconnect();
});
