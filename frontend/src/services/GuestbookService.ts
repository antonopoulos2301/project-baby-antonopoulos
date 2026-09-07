import type {
  CreateGuestbookMessageInput,
  GuestbookMessage,
} from "../types/Guestbook";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export const guestbookService = {
  async findAll(): Promise<GuestbookMessage[]> {
    const response = await fetch(`${API_URL}/api/guestbook`);

    if (!response.ok) {
      throw new Error("Não foi possível carregar as mensagens.");
    }

    return response.json();
  },

  async create(data: CreateGuestbookMessageInput): Promise<GuestbookMessage> {
    const response = await fetch("/api/guestbook", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);

      throw new Error(body?.error ?? "Não foi possível enviar sua mensagem.");
    }

    return response.json();
  },
};
