import { Router } from "express";

import { guestbookController } from "../controllers/GuestbookController";

export const guestbookRouter = Router();

guestbookRouter.get("/", guestbookController.index);

guestbookRouter.post("/", guestbookController.create);
