import type { Request, Response } from "express";
import { createGuestbookMessageSchema } from "../schemas/GuestbookSchema";
import { guestbookService } from "../services/GuestbookService";

export const guestbookController = {
  async index(req: Request, res: Response) {
    try {
      const messages = await guestbookService.findAll();
      return res.json(messages);
    } catch (error) {
      return res.status(500).json({
        error: "Não foi possível carregar as mensagens",
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const validation = createGuestbookMessageSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: "Dados inválidos.",

          fields: validation.error.flatten().fieldErrors,
        });
      }

      const message = await guestbookService.create(validation.data);

      return res.status(201).json(message);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Não foi possível salvar a mensagem.",
      });
    }
  },
};
