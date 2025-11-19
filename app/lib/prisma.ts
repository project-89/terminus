// This is a workaround for Netlify builds
let PrismaClientClass: any;
let prismaInstance: any;

// Mock Client Definition
class MockPrismaClient {
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

  experiment = {
    findMany: async () => [],
    create: async () => ({ id: "mock-exp-id", createdAt: new Date() }),
  };

  experimentEvent = {
    create: async () => ({}),
    findMany: async () => [],
  };

  agentNote = {
    findMany: async () => [],
    create: async () => ({}),
  };
}

try {
  // Try to import PrismaClient
  PrismaClientClass = require("@prisma/client").PrismaClient;
  console.log("Successfully imported PrismaClient class");

  // Try to instantiate it immediately to catch initialization errors
  prismaInstance = new PrismaClientClass();
  console.log("Successfully initialized PrismaClient instance");
} catch (error) {
  console.warn(
    "PrismaClient failed to initialize, falling back to mock:",
    error
  );
  prismaInstance = new MockPrismaClient();
}

// Use a global variable to prevent multiple instances during development
const globalForPrisma = global as unknown as { prisma: any };

// Use the instance we created (real or mock)
export const prisma = globalForPrisma.prisma || prismaInstance;

// Store the instance if we're not in production
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
