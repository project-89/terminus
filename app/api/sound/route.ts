import { ElevenLabsClient } from "elevenlabs";
import { NextResponse } from "next/server";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { description, duration, influence } = await req.json();

    const result = await client.textToSoundEffects.convert({
      text: description,
      duration_seconds: duration,
      prompt_influence: influence,
    });

    // Convert stream to array buffer
    const chunks = [];
    for await (const chunk of result) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Return audio data
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Sound generation error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate sound" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
