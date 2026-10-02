import type { Request, Response } from "express";
import { createGuestbookMessageSchema } from "../schemas/GuestbookSchema";
import {
  guestbookService,
  type GuestbookStatusValue,
} from "../services/GuestbookService";

const STATUSES: GuestbookStatusValue[] = ["PENDING", "APPROVED", "REJECTED"];

export const guestbookController = {
  async index(_req: Request, res: Response) {
    try {
      const messages = await guestbookService.findApproved();
      return res.json(messages);
    } catch (error) {
      console.error(error);
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

  // Admin: lista com filtro opcional ?status=PENDING|APPROVED|REJECTED
  async adminList(req: Request, res: Response) {
    try {
      const raw = req.query.status;
      const status =
        typeof raw === "string" && STATUSES.includes(raw as GuestbookStatusValue)
          ? (raw as GuestbookStatusValue)
          : undefined;

      const messages = await guestbookService.listForAdmin(status);
      return res.json(messages);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Não foi possível carregar o painel." });
    }
  },

  // Admin: aprovar/reprovar
  async setStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Mensagem inválida." });
      }

      const status = req.body.status as GuestbookStatusValue;
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ error: "Status inválido." });
      }

      const updated = await guestbookService.setStatus(id, status);
      return res.json(updated);
    } catch (err: any) {
      if (err?.code === "P2025") {
        return res.status(404).json({ error: "Mensagem não encontrada." });
      }
      console.error(err);
      return res.status(500).json({ error: "Não foi possível atualizar a mensagem." });
    }
  },
};
