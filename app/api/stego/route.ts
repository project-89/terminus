import { NextResponse } from "next/server";
import * as stego from "@/app/lib/puzzles/steganography";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const action = formData.get("action") as string;
    const imageFile = formData.get("image") as File | null;

    if (!imageFile && action !== "decode_url") {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    const imageBuffer = imageFile 
      ? Buffer.from(await imageFile.arrayBuffer())
      : null;

    switch (action) {
      case "encode": {
        const message = formData.get("message") as string;
        const puzzleId = formData.get("puzzleId") as string | null;
        
        if (!message || !imageBuffer) {
          return NextResponse.json({ error: "Message and image required" }, { status: 400 });
        }

        const encoded = await stego.encodeMessage(imageBuffer, {
          type: "message",
          data: { message },
          puzzleId: puzzleId || undefined,
          timestamp: Date.now(),
        });

        return new NextResponse(new Uint8Array(encoded), {
          headers: {
            "Content-Type": "image/png",
            "X-Stego-Encoded": "true",
          },
        });
      }

      case "decode": {
        if (!imageBuffer) {
          return NextResponse.json({ error: "Image required" }, { status: 400 });
        }

        const payload = await stego.decodeMessage(imageBuffer);
        
        if (!payload) {
          return NextResponse.json({ 
            found: false, 
            message: "No hidden data found" 
          });
        }

        return NextResponse.json({ 
          found: true, 
          payload 
        });
      }

      case "embed_coordinates": {
        const lat = parseFloat(formData.get("lat") as string);
        const lng = parseFloat(formData.get("lng") as string);
        const hint = formData.get("hint") as string | null;

        if (!imageBuffer || isNaN(lat) || isNaN(lng)) {
          return NextResponse.json({ error: "Image, lat, lng required" }, { status: 400 });
        }

        const encoded = await stego.embedCoordinates(imageBuffer, lat, lng, hint || undefined);

        return new NextResponse(new Uint8Array(encoded), {
          headers: {
            "Content-Type": "image/png",
            "X-Stego-Type": "coordinates",
          },
        });
      }

      case "embed_puzzle_fragment": {
        const puzzleId = formData.get("puzzleId") as string;
        const fragment = formData.get("fragment") as string;
        const order = parseInt(formData.get("order") as string);
        const total = parseInt(formData.get("totalFragments") as string);

        if (!imageBuffer || !puzzleId || !fragment) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const encoded = await stego.embedPuzzleFragment(
          imageBuffer,
          puzzleId,
          fragment,
          order || 0,
          total || 1
        );

        return new NextResponse(new Uint8Array(encoded), {
          headers: {
            "Content-Type": "image/png",
            "X-Stego-Type": "puzzle_fragment",
            "X-Puzzle-Id": puzzleId,
          },
        });
      }

      case "embed_visual": {
        const pattern = formData.get("pattern") as "grid89" | "spiral" | "qr_ghost";
        const intensity = parseInt(formData.get("intensity") as string) || 2;

        if (!imageBuffer || !pattern) {
          return NextResponse.json({ error: "Image and pattern required" }, { status: 400 });
        }

        const encoded = await stego.embedVisualPattern(imageBuffer, pattern, intensity);

        return new NextResponse(new Uint8Array(encoded), {
          headers: {
            "Content-Type": "image/png",
            "X-Stego-Type": "visual",
            "X-Visual-Pattern": pattern,
          },
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Stego API error:", error);
    return NextResponse.json(
      { error: "Steganography operation failed", details: String(error) },
      { status: 500 }
    );
  }
}
