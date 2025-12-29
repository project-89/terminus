import { resetGameState } from "@/app/lib/server/gameStateService";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "sessionId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await resetGameState(sessionId);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Game reset error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to reset game state" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
