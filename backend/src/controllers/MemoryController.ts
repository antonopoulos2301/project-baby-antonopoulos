import type { Request, Response } from "express";
import { memoryService } from "../services/MemoryService";
import { memo } from "react";

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
      const { title, description, happenedAt, imageUrl, type } = req.body;
      if (!title) {
        return res.status(400).json({ error: "O titulo é obrigatório." });
      }
      if (!happenedAt) {
        return res.status(400).json({
          error: "A data é obrigatória.",
        });
      }

      const date = new Date(happenedAt);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          error: "A data informada é inválida.",
        });
      }

      const memory = await memoryService.create({
        title,
        description,
        happenedAt: date,
        imageUrl,
        type,
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
