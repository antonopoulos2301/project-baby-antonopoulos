import { Router } from "express";
import { memoryController } from "../controllers/MemoryController";

export const memoryRouter = Router();

memoryRouter.get("/", memoryController.index);
memoryRouter.post("/", memoryController.create);
