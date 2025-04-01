// This is a workaround for Netlify builds
// We only import PrismaClient if it's available
let PrismaClient: any;
try {
  // Try to import PrismaClient
  PrismaClient = require("@prisma/client").PrismaClient;
} catch (error) {
  console.warn("PrismaClient not available, using a mock instead");
  // Create a mock PrismaClient for builds
  PrismaClient = class MockPrismaClient {
    constructor() {
      console.warn("Using mock PrismaClient");
    }
  };
}

// Use a global variable to prevent multiple instances during development
const globalForPrisma = global as unknown as { prisma: any };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
