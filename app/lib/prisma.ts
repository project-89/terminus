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
  };
}

// Use a global variable to prevent multiple instances during development
const globalForPrisma = global as unknown as { prisma: any };

// Create a new instance or use an existing one
export const prisma = globalForPrisma.prisma || new PrismaClient();

// Store the instance if we're not in production
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
