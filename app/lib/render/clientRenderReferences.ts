export type RenderReferencePayload = {
  mimeType: string;
  data: string;
  label?: string;
};

const MAX_STORED_REFERENCES = 6;
const DEFAULT_SENT_REFERENCES = 3;

const renderReferenceCache = new Map<string, RenderReferencePayload[]>();

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const commaIdx = result.indexOf(",");
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error("Failed to encode image blob"));
    reader.readAsDataURL(blob);
  });
}

export async function pushRenderReference(
  sessionId: string,
  blob: Blob,
  label?: string
): Promise<void> {
  if (!sessionId) return;
  try {
    const data = await blobToBase64(blob);
    const next: RenderReferencePayload[] = [
      ...(renderReferenceCache.get(sessionId) || []),
      {
        mimeType: blob.type || "image/png",
        data,
        label,
      },
    ].slice(-MAX_STORED_REFERENCES);
    renderReferenceCache.set(sessionId, next);
  } catch (error) {
    console.warn("[render] Failed to cache reference image", error);
  }
}

export function getRenderReferences(
  sessionId: string,
  maxToSend = DEFAULT_SENT_REFERENCES
): RenderReferencePayload[] {
  const current = renderReferenceCache.get(sessionId) || [];
  return current.slice(-Math.max(1, maxToSend));
}

export function clearRenderReferences(sessionId?: string): void {
  if (sessionId) {
    renderReferenceCache.delete(sessionId);
    return;
  }
  renderReferenceCache.clear();
}
