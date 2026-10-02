import { Router } from "express";

import { guestbookController } from "../controllers/GuestbookController";
import { adminAuth } from "../middleware/adminAuth";

export const guestbookRouter = Router();

guestbookRouter.get("/", guestbookController.index);
guestbookRouter.post("/", guestbookController.create);

// Painel de moderação (admin)
guestbookRouter.get("/admin", adminAuth, guestbookController.adminList);
guestbookRouter.patch("/:id/status", adminAuth, guestbookController.setStatus);
