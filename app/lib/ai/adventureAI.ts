export async function getAdventureResponse(messages: any[]) {
  const response = await fetch("/api/adventure", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get AI response");
  }

  // The response will be a ReadableStream
  return response.body;
}
