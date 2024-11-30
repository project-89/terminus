import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { Terminal } from "../terminal/Terminal";

export async function generateOneOffResponse(
  message: string,
  terminal: Terminal,
  options: { addSpacing?: boolean; color?: string } = { addSpacing: false }
) {
  try {
    terminal.startGeneration();

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

    if (!response.ok || !response.body) {
      throw new Error("Failed to get AI response");
    }

    // Process the stream
    return await terminal.processAIStream(response.body);
  } catch (error) {
    console.error("Error in one-off generation:", error);
    throw error;
  } finally {
    terminal.endGeneration();
  }
}

export async function generateCLIResponse(
  message: string,
  terminal: Terminal,
  options = { addSpacing: false }
) {
  try {
    terminal.startGeneration();

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

    if (!response.ok || !response.body) {
      throw new Error("Failed to get CLI response");
    }

    // Process the stream
    return await terminal.processAIStream(response.body);
  } catch (error) {
    console.error("Error in CLI generation:", error);
    throw error;
  } finally {
    terminal.endGeneration();
  }
}
