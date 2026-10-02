import { prisma } from "../lib/prisma";

export const photoService = {
  findAll() {
    return prisma.photo.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reactions: { select: { emoji: true, count: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, text: true, createdAt: true },
        },
      },
    });
  },

  create(data: { title?: string; imageUrl: string }) {
    return prisma.photo.create({ data });
  },

  // --- Engajamento (reações e comentários) ---
  reactionsFor(photoId: number) {
    return prisma.photoReaction.findMany({
      where: { photoId },
      select: { emoji: true, count: true },
    });
  },

  async addReaction(photoId: number, emoji: string) {
    await prisma.photoReaction.upsert({
      where: { photoId_emoji: { photoId, emoji } },
      create: { photoId, emoji, count: 1 },
      update: { count: { increment: 1 } },
    });
    return this.reactionsFor(photoId);
  },

  async removeReaction(photoId: number, emoji: string) {
    const existing = await prisma.photoReaction.findUnique({
      where: { photoId_emoji: { photoId, emoji } },
    });
    if (existing && existing.count > 0) {
      await prisma.photoReaction.update({
        where: { photoId_emoji: { photoId, emoji } },
        data: { count: { decrement: 1 } },
      });
    }
    return this.reactionsFor(photoId);
  },

  addComment(photoId: number, name: string, text: string) {
    return prisma.photoComment.create({
      data: { photoId, name, text },
      select: { id: true, name: true, text: true, createdAt: true },
    });
  },
};
