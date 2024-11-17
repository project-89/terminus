import { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import * as path from "path";

const BASE_DIR = path.join(process.cwd(), "public", "archive");

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { path: filePath = "", download } = req.query;

  let targetPath = Array.isArray(filePath)
    ? path.join(...filePath)
    : (filePath as string);
  targetPath = path.join(BASE_DIR, targetPath);

  // Ensure the path is within the BASE_DIR
  if (!targetPath.startsWith(BASE_DIR)) {
    return res.status(400).json({ error: "Invalid path" });
  }

  if (download === "1") {
    // Handle file download
    try {
      const fileStream = fs.createReadStream(targetPath);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(targetPath)}"`
      );
      res.setHeader("Content-Type", "application/octet-stream");

      fileStream.pipe(res);
    } catch (error) {
      console.error("Error sending file", error);
      res.status(500).json({ error: "Failed to send file" });
    }
    return;
  }

  try {
    const items = fs.readdirSync(targetPath).map((name) => {
      const stats = fs.statSync(path.join(targetPath, name));
      return {
        name,
        isDirectory: stats.isDirectory(),
      };
    });
    res.status(200).json({ items });
  } catch (error) {
    console.error("Error reading directory", error);
    res.status(500).json({ error: "Failed to read directory" });
  }
};
