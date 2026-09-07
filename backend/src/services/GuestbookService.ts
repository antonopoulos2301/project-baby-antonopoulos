import { prisma } from "../lib/prisma";
import type { CreateGuestbookMessageInput } from "../schemas/GuestbookSchema";

export const guestbookService = {
  async findAll() {
    return prisma.guestbookMessage.findMany({
      select: {
        id: true,
        name: true,
        message: true,
        email: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async create(data: CreateGuestbookMessageInput) {
    return prisma.guestbookMessage.create({
      data: {
        name: data.name,
        email: data.email,
        message: data.message,
      },
      select: {
        id: true,
        name: true,
        message: true,
        createdAt: true,
      },
    });
  },
};
