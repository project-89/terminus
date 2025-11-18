
// Mock Prisma client for Netlify builds
class PrismaClient {
  constructor() {
    console.log('Using mock PrismaClient');
  }

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
}

const Role = {
  AGENT: "AGENT",
  ADMIN: "ADMIN"
};

module.exports = {
  PrismaClient,
  Role
};
