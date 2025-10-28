import prisma from "@/app/lib/prisma";

export async function POST(req: Request) {
  const { userHandle, threadId, key, value } = await req.json();
  if (!userHandle || !key) {
    return new Response(
      JSON.stringify({ error: "userHandle and key required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  let user = await prisma.user.findUnique({ where: { handle: userHandle } });
  if (!user) user = await prisma.user.create({ data: { handle: userHandle } });

  const note = await prisma.agentNote.create({
    data: { userId: user.id, threadId: threadId || null, key, value },
  });
  return new Response(JSON.stringify({ id: note.id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
