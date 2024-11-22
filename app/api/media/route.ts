import { readdir } from "fs/promises";
import { join } from "path";

export async function GET() {
  const mediaDir = join(process.cwd(), "public", "media");
  const files = await readdir(mediaDir);
  
  const tracks = files
    .filter(file => file.endsWith(".mp3"))
    .map(file => ({
      title: file.replace(".mp3", ""),
      path: `/media/${file}`,
      duration: 0  // Duration will be determined by the audio element when loaded
    }));

  return Response.json(tracks);
}
