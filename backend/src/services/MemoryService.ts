import { prisma } from "../lib/prisma";

interface CreateMemoryData {
  title: string;
  description?: string;
  happenedAt: Date;
  imageUrl?: string;
  type: any;
}

export const memoryService = {
  async findAll() {
    return prisma.memoria.findMany({
      orderBy: {
        happenedAt: "desc",
      },
      include: {
        reactions: {
          select: { emoji: true, count: true },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, text: true, createdAt: true },
        },
      },
    });
  },

  async create(data: CreateMemoryData) {
    return prisma.memoria.create({
      data,
    });
  },
};
