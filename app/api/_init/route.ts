import { initializeServer } from "@/app/lib/server";

let initialized = false;

export async function GET() {
  if (!initialized) {
    initializeServer();
    initialized = true;
  }

  return new Response(JSON.stringify({ status: "initialized" }), {
    headers: { "Content-Type": "application/json" },
  });
}
