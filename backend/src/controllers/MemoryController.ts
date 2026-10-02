import type { Request, Response } from "express";
import { memoryService } from "../services/MemoryService";
import { uploadToR2, isR2Configured } from "../lib/r2";

const MEMORY_TYPES = [
  "GRAVIDEZ",
  "NASCIMENTO",
  "MARCO",
  "ANIVERSÁRIO",
  "FOTO",
  "CARTA",
  "OUTRO",
] as const;

export const memoryController = {
  async index(req: Request, res: Response) {
    try {
      const memories = await memoryService.findAll();
      return res.json(memories);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Não foi possível carregar as memórias" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { title, description, happenedAt, type } = req.body;
      let imageUrl: string | undefined = req.body.imageUrl || undefined;

      if (!title) {
        return res.status(400).json({ error: "O título é obrigatório." });
      }

      if (!happenedAt) {
        return res.status(400).json({ error: "A data é obrigatória." });
      }

      const date = new Date(happenedAt);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ error: "A data informada é inválida." });
      }

      if (type && !MEMORY_TYPES.includes(type)) {
        return res.status(400).json({ error: "Categoria inválida." });
      }

      // Upload da imagem para o R2, quando enviada
      if (req.file) {
        if (!isR2Configured) {
          return res.status(500).json({
            error:
              "Upload de imagem não configurado no servidor (variáveis R2 ausentes).",
          });
        }

        try {
          const uploaded = await uploadToR2({
            buffer: req.file.buffer,
            contentType: req.file.mimetype,
            originalName: req.file.originalname,
          });
          imageUrl = uploaded.url;
        } catch (uploadErr: any) {
          console.error(uploadErr);
          return res.status(502).json({
            error: "Falha ao enviar a imagem para o bucket.",
            detail:
              uploadErr?.name ||
              uploadErr?.Code ||
              uploadErr?.message ||
              String(uploadErr),
          });
        }
      }

      const memory = await memoryService.create({
        title,
        description: description || undefined,
        happenedAt: date,
        imageUrl,
        type: type || undefined,
      });

      return res.status(201).json(memory);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Não foi possível criar a memória." });
    }
  },
};
