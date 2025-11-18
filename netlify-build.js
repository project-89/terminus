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

// Generate Prisma client
console.log("🔧 Generating Prisma client...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
} catch (error) {
  console.error("Failed to generate Prisma client:", error);
  process.exit(1);
}

// Build the Next.js application
console.log("🏗️ Building Next.js application...");
try {
  execSync("node_modules/.bin/next build", { stdio: "inherit" });
  console.log("✅ Build completed successfully!");
} catch (error) {
  console.error("Failed to build Next.js application:", error);
  process.exit(1);
}
