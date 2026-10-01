import type { Request, Response } from "express";
import { pollService, type Team } from "../services/PollService";

const TEAMS: Team[] = ["FILIPE", "MELINA"];

export const pollController = {
  async index(_req: Request, res: Response) {
    try {
      const results = await pollService.results();
      return res.json(results);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Não foi possível carregar a enquete." });
    }
  },

  async vote(req: Request, res: Response) {
    try {
      const rawName =
        typeof req.body.name === "string" ? req.body.name.trim() : "";
      const team = req.body.team as Team;

      if (rawName.length < 2) {
        return res.status(400).json({ error: "Informe seu nome para votar." });
      }
      if (rawName.length > 80) {
        return res.status(400).json({ error: "Nome muito longo." });
      }
      if (!TEAMS.includes(team)) {
        return res.status(400).json({ error: "Escolha um time para votar." });
      }

      await pollService.create(rawName, team);
      const results = await pollService.results();
      return res.status(201).json(results);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Não foi possível registrar seu voto." });
    }
  },
};
