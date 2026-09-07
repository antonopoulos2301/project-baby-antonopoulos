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
    });
  },

  async create(data: CreateMemoryData) {
    return prisma.memoria.create({
      data,
    });
  },
};
