import type { Request, Response } from "express";
import { engagementService } from "../services/EngagementService";

const ALLOWED_EMOJIS = ["❤️", "😍", "🥰", "👏", "😂"];

function parseId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const engagementController = {
  async addReaction(req: Request, res: Response) {
    try {
      const id = parseId(req);
      if (id === null) return res.status(400).json({ error: "Memória inválida." });

      const emoji = req.body.emoji;
      if (!ALLOWED_EMOJIS.includes(emoji)) {
        return res.status(400).json({ error: "Reação inválida." });
      }

      const reactions = await engagementService.addReaction(id, emoji);
      return res.status(201).json(reactions);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Não foi possível reagir." });
    }
  },

  async removeReaction(req: Request, res: Response) {
    try {
      const id = parseId(req);
      if (id === null) return res.status(400).json({ error: "Memória inválida." });

      const emoji = req.body.emoji;
      if (!ALLOWED_EMOJIS.includes(emoji)) {
        return res.status(400).json({ error: "Reação inválida." });
      }

      const reactions = await engagementService.removeReaction(id, emoji);
      return res.json(reactions);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Não foi possível remover a reação." });
    }
  },

  async addComment(req: Request, res: Response) {
    try {
      const id = parseId(req);
      if (id === null) return res.status(400).json({ error: "Memória inválida." });

      const name =
        typeof req.body.name === "string" ? req.body.name.trim() : "";
      const text =
        typeof req.body.text === "string" ? req.body.text.trim() : "";

      if (name.length < 2) {
        return res.status(400).json({ error: "Informe seu nome." });
      }
      if (name.length > 80) {
        return res.status(400).json({ error: "Nome muito longo." });
      }
      if (text.length < 1) {
        return res.status(400).json({ error: "Escreva um comentário." });
      }
      if (text.length > 500) {
        return res
          .status(400)
          .json({ error: "O comentário deve ter no máximo 500 caracteres." });
      }

      const comment = await engagementService.addComment(id, name, text);
      return res.status(201).json(comment);
    } catch (err: any) {
      // FK inexistente (memória não existe)
      if (err?.code === "P2003") {
        return res.status(404).json({ error: "Memória não encontrada." });
      }
      console.error(err);
      return res
        .status(500)
        .json({ error: "Não foi possível enviar o comentário." });
    }
  },
};
