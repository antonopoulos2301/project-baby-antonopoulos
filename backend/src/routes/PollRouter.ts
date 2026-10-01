import { Router } from "express";
import { pollController } from "../controllers/PollController";

export const pollRouter = Router();

pollRouter.get("/", pollController.index);
pollRouter.post("/", pollController.vote);
