import prisma from "@/app/lib/prisma";
import { memoryStore } from "@/app/lib/server/memoryStore";

export async function POST() {
  const results = {
    users: { found: 0, created: 0, existing: 0 },
    sessions: { found: 0, created: 0, existing: 0 },
    messages: { found: 0, created: 0 },
    errors: [] as string[],
  };

  try {
    const memUsers = Array.from(memoryStore.users.values());
    results.users.found = memUsers.length;

    const userIdMapping = new Map<string, string>();

    for (const memUser of memUsers) {
      let dbUser = await prisma.user.findUnique({ where: { handle: memUser.handle } });

      if (!dbUser) {
        try {
          dbUser = await prisma.user.create({
            data: { handle: memUser.handle },
          });
          results.users.created++;
        } catch (e: any) {
          results.errors.push(`Failed to create user ${memUser.handle}: ${e.message}`);
          continue;
        }
      } else {
        results.users.existing++;
      }

      userIdMapping.set(memUser.id, dbUser.id);

      const memSessions = memoryStore.sessionsByUser.get(memUser.id) || [];
      results.sessions.found += memSessions.length;

      for (const memSession of memSessions) {
        const existingSession = await prisma.gameSession.findUnique({
          where: { id: memSession.id },
        });

        let sessionId = memSession.id;

        if (!existingSession) {
          try {
            const newSession = await prisma.gameSession.create({
              data: {
                userId: dbUser.id,
                status: memSession.status,
                summary: memSession.summary,
                createdAt: memSession.createdAt,
                updatedAt: memSession.updatedAt,
              },
            });
            sessionId = newSession.id;
            results.sessions.created++;
          } catch (e: any) {
            results.errors.push(`Failed to create session: ${e.message}`);
            continue;
          }
        } else {
          results.sessions.existing++;
          sessionId = existingSession.id;
        }

        const memMessages = memoryStore.messages.get(memSession.id) || [];
        results.messages.found += memMessages.length;

        for (const msg of memMessages) {
          try {
            await prisma.gameMessage.create({
              data: {
                gameSessionId: sessionId,
                role: msg.role,
                content: msg.content,
                createdAt: msg.createdAt,
              },
            });
            results.messages.created++;
          } catch {
            // Skip duplicates
          }
        }
      }
    }

    return Response.json({
      success: true,
      results,
      memoryStats: {
        users: memoryStore.users.size,
        usersById: memoryStore.usersById.size,
        sessions: memoryStore.sessions.size,
        sessionsByUser: memoryStore.sessionsByUser.size,
        messages: memoryStore.messages.size,
      },
    });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message, results }, { status: 500 });
  }
}
