import { prisma } from "../lib/prisma";
import type { CreateGuestbookMessageInput } from "../schemas/GuestbookSchema";

export type GuestbookStatusValue = "PENDING" | "APPROVED" | "REJECTED";

export const guestbookService = {
  // Público: apenas mensagens aprovadas
  async findApproved() {
    return prisma.guestbookMessage.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        name: true,
        message: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(data: CreateGuestbookMessageInput) {
    return prisma.guestbookMessage.create({
      data: {
        name: data.name,
        email: data.email,
        message: data.message,
        // status fica PENDING por padrão (aguardando aprovação)
      },
      select: {
        id: true,
        name: true,
        message: true,
        createdAt: true,
      },
    });
  },

  // Admin: lista completa (com e-mail e status), opcionalmente filtrada
  async listForAdmin(status?: GuestbookStatusValue) {
    return prisma.guestbookMessage.findMany({
      where: status ? { status } : {},
      select: {
        id: true,
        name: true,
        email: true,
        message: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async setStatus(id: number, status: GuestbookStatusValue) {
    return prisma.guestbookMessage.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        message: true,
        status: true,
        createdAt: true,
      },
    });
  },
};
