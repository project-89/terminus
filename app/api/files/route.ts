import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const BASE_DIR = path.join(process.cwd(), "public", "archive");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path") || "";
  const download = searchParams.get("download");
  const view = searchParams.get("view");

  let targetPath = path.join(BASE_DIR, filePath);

  // Ensure the path is within the BASE_DIR
  if (!targetPath.startsWith(BASE_DIR)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  if (view === "1") {
    try {
      const content = fs.readFileSync(targetPath, "utf-8");
      return new NextResponse(content, {
        headers: {
          "Content-Type": "text/plain",
        },
      });
    } catch (error) {
      console.error("Error reading file", error);
      return NextResponse.json(
        { error: "Failed to read file" },
        { status: 500 }
      );
    }
  }

  if (download === "1") {
    try {
      const fileBuffer = fs.readFileSync(targetPath);
      const headers = new Headers();
      headers.set(
        "Content-Disposition",
        `attachment; filename="${path.basename(targetPath)}"`
      );
      headers.set("Content-Type", "application/octet-stream");

      return new NextResponse(fileBuffer, { headers });
    } catch (error) {
      console.error("Error sending file", error);
      return NextResponse.json(
        { error: "Failed to send file" },
        { status: 500 }
      );
    }
  }

  try {
    const items = fs.readdirSync(targetPath).map((name) => {
      const stats = fs.statSync(path.join(targetPath, name));
      return {
        name,
        isDirectory: stats.isDirectory(),
      };
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error reading directory", error);
    return NextResponse.json(
      { error: "Failed to read directory" },
      { status: 500 }
    );
  }
}
