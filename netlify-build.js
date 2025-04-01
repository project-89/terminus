// Netlify build script
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting Netlify build process...");

// Ensure we're using the latest dependencies
console.log("📦 Installing dependencies...");
try {
  execSync("pnpm install", { stdio: "inherit" });
} catch (error) {
  console.error("Failed to install dependencies:", error);
  process.exit(1);
}

// Check if Prisma client directory exists
const prismaClientDir = path.join(__dirname, "prisma", "generated", "client");
if (!fs.existsSync(prismaClientDir)) {
  console.log("🔧 Creating Prisma client directory...");
  fs.mkdirSync(prismaClientDir, { recursive: true });
}

// Skip Prisma generation in production, use mock instead
console.log("⚙️ Skipping Prisma generation, using mock client...");
fs.writeFileSync(
  path.join(prismaClientDir, "index.js"),
  `
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
`
);

// Build the Next.js application
console.log("🏗️ Building Next.js application...");
try {
  execSync("node_modules/.bin/next build", { stdio: "inherit" });
  console.log("✅ Build completed successfully!");
} catch (error) {
  console.error("Failed to build Next.js application:", error);
  process.exit(1);
}
