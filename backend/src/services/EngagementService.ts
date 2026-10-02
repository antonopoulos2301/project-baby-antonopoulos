import { prisma } from "../lib/prisma";

export const engagementService = {
  reactionsFor(memoriaId: number) {
    return prisma.memoryReaction.findMany({
      where: { memoriaId },
      select: { emoji: true, count: true },
    });
  },

  async addReaction(memoriaId: number, emoji: string) {
    await prisma.memoryReaction.upsert({
      where: { memoriaId_emoji: { memoriaId, emoji } },
      create: { memoriaId, emoji, count: 1 },
      update: { count: { increment: 1 } },
    });
    return this.reactionsFor(memoriaId);
  },

  async removeReaction(memoriaId: number, emoji: string) {
    const existing = await prisma.memoryReaction.findUnique({
      where: { memoriaId_emoji: { memoriaId, emoji } },
    });

    if (existing && existing.count > 0) {
      await prisma.memoryReaction.update({
        where: { memoriaId_emoji: { memoriaId, emoji } },
        data: { count: { decrement: 1 } },
      });
    }

    return this.reactionsFor(memoriaId);
  },

  addComment(memoriaId: number, name: string, text: string) {
    return prisma.memoryComment.create({
      data: { memoriaId, name, text },
      select: { id: true, name: true, text: true, createdAt: true },
    });
  },
};
