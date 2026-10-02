import type { Request, Response } from "express";
import { photoService } from "../services/PhotoService";
import { uploadToR2, isR2Configured } from "../lib/r2";

const ALLOWED_EMOJIS = ["❤️", "😍", "🥰", "👏", "😂"];

function parseId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const photoController = {
  async index(_req: Request, res: Response) {
    try {
      return res.json(await photoService.findAll());
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Não foi possível carregar o álbum." });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const title =
        typeof req.body.title === "string" && req.body.title.trim()
          ? req.body.title.trim().slice(0, 120)
          : undefined;

      if (!req.file) {
        return res.status(400).json({ error: "Selecione uma foto." });
      }
      if (!isR2Configured) {
        return res.status(500).json({
          error: "Upload de imagem não configurado no servidor.",
        });
      }

      let imageUrl: string;
      try {
        const uploaded = await uploadToR2({
          buffer: req.file.buffer,
          contentType: req.file.mimetype,
          originalName: req.file.originalname,
          prefix: "album",
        });
        imageUrl = uploaded.url;
      } catch (uploadErr: any) {
        console.error(uploadErr);
        return res.status(502).json({
          error: "Falha ao enviar a imagem para o bucket.",
          detail:
            uploadErr?.name || uploadErr?.Code || uploadErr?.message || String(uploadErr),
        });
      }

      const photo = await photoService.create({ title, imageUrl });
      return res.status(201).json(photo);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Não foi possível salvar a foto." });
    }
  },

  async addReaction(req: Request, res: Response) {
    try {
      const id = parseId(req);
      if (id === null) return res.status(400).json({ error: "Foto inválida." });
      const emoji = req.body.emoji;
      if (!ALLOWED_EMOJIS.includes(emoji)) {
        return res.status(400).json({ error: "Reação inválida." });
      }
      return res.status(201).json(await photoService.addReaction(id, emoji));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Não foi possível reagir." });
    }
  },

  async removeReaction(req: Request, res: Response) {
    try {
      const id = parseId(req);
      if (id === null) return res.status(400).json({ error: "Foto inválida." });
      const emoji = req.body.emoji;
      if (!ALLOWED_EMOJIS.includes(emoji)) {
        return res.status(400).json({ error: "Reação inválida." });
      }
      return res.json(await photoService.removeReaction(id, emoji));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Não foi possível remover a reação." });
    }
  },

  async addComment(req: Request, res: Response) {
    try {
      const id = parseId(req);
      if (id === null) return res.status(400).json({ error: "Foto inválida." });

      const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
      const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

      if (name.length < 2) return res.status(400).json({ error: "Informe seu nome." });
      if (name.length > 80) return res.status(400).json({ error: "Nome muito longo." });
      if (text.length < 1) return res.status(400).json({ error: "Escreva um comentário." });
      if (text.length > 500) {
        return res.status(400).json({ error: "O comentário deve ter no máximo 500 caracteres." });
      }

      return res.status(201).json(await photoService.addComment(id, name, text));
    } catch (err: any) {
      if (err?.code === "P2003") {
        return res.status(404).json({ error: "Foto não encontrada." });
      }
      console.error(err);
      return res.status(500).json({ error: "Não foi possível enviar o comentário." });
    }
  },
};
