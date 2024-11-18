import { getFileProvider } from "@/app/lib/files";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get("path") || "";
  const view = url.searchParams.get("view") === "1";

  const fileProvider = getFileProvider();

  try {
    if (view) {
      const extension = path.split(".").pop()?.toLowerCase();
      
      if (extension === 'pdf') {
        // For PDFs, return the raw buffer
        const content = await fileProvider.readFile(path, true); // Add support for binary reading
        return new Response(content, {
          headers: { 
            "Content-Type": "application/pdf",
            "Content-Disposition": "inline"
          },
        });
      }

      // For text files
      const content = await fileProvider.readFile(path);
      const contentType = {
        md: "text/markdown",
        txt: "text/plain",
      }[extension || ""] || "text/plain";

      return new Response(content, {
        headers: { "Content-Type": contentType },
      });
    } else {
      // Listing directory contents
      let realItems = await fileProvider.readDirectory(path);
      let metadata = await fileProvider.readMetadata(path);

      // Generate AI items if in vault...

      return new Response(JSON.stringify(realItems), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Archive API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to access archive" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
