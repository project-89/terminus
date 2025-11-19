// This is a workaround for Netlify builds
// We only import PrismaClient if it's available
let PrismaClient: any;
try {
  // Try to import PrismaClient
  PrismaClient = require("@prisma/client").PrismaClient;
  console.log("Successfully imported PrismaClient");
} catch (error) {
  console.warn("PrismaClient not available, using a mock instead");
  // Create a mock PrismaClient for builds
  PrismaClient = class MockPrismaClient {
    constructor() {
      console.warn("Using mock PrismaClient");
    }

    // Add mock methods that might be used in the application
    user = {
      findUnique: async () => null,
      findMany: async () => [],
      create: async () => ({}),
      update: async () => ({}),
    };

    session = {
      findUnique: async () => null,
      findMany: async () => [],
      create: async () => ({}),
      delete: async () => ({}),
    };

    gameSession = {
      findFirst: async () => null,
      findMany: async () => [],
      create: async () => ({}),
      update: async () => ({}),
    };

    gameMessage = {
      create: async () => ({}),
      createMany: async () => ({ count: 0 }),
      findMany: async () => [],
    };

    memoryEvent = {
      create: async () => ({}),
      findMany: async () => [],
    };

    memoryEmbedding = {
      create: async () => ({}),
    };

    playerProfile = {
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
    };

    missionDefinition = {
      findMany: async () => [],
      findFirst: async () => null,
      create: async () => ({}),
    };

    missionRun = {
      findFirst: async () => null,
      findMany: async () => [],
      create: async () => ({}),
      update: async () => ({}),
    };

    reward = {
      create: async () => ({}),
      findMany: async () => [],
    };

    thread = {
      findUnique: async () => null,
      create: async () => ({ id: "mock-thread-id" }),
    };

    message = {
      findMany: async () => [],
      createMany: async () => ({ count: 0 }),
    };
  };
}

// Use a global variable to prevent multiple instances during development
const globalForPrisma = global as unknown as { prisma: any };

// Create a new instance or use an existing one
export const prisma = globalForPrisma.prisma || new PrismaClient();

// Store the instance if we're not in production
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
