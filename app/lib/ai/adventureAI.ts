export type AdventureRequestContext = {
  sessionId?: string;
  handle?: string;
  activeMissionRunId?: string;
  reportSummary?: string | null;
  reportJustSubmitted?: boolean;
  accessTier?: number;
  hasFullAccess?: boolean;
};

export async function getAdventureResponse(
  messages: any[],
  context?: AdventureRequestContext
) {
  const response = await fetch("/api/adventure", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      context,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get AI response");
  }

  // The response will be a ReadableStream
  return response.body;
}
