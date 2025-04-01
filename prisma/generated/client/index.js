
// Mock Prisma client for Netlify builds
class PrismaClient {
  constructor() {
    console.log('Using mock PrismaClient');
  }
}

module.exports = {
  PrismaClient
};
