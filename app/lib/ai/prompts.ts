import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function generateOneOffResponse(
  message: string,
  terminal: any,
  options = { addSpacing: false }
) {
  try {
    const response = await fetch("/api/adventure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get AI response");
    }

    // Process the stream
    return terminal.processAIStream(response.body, options);
  } catch (error) {
    console.error("Error in one-off generation:", error);
    throw error;
  }
}

export async function generateCLIResponse(
  message: string,
  terminal: any,
  options = { addSpacing: false }
) {
  try {
    const response = await fetch("/api/project89cli", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get CLI response");
    }

    // Process the stream
    return terminal.processAIStream(response.body, options);
  } catch (error) {
    console.error("Error in CLI generation:", error);
    throw error;
  }
}
