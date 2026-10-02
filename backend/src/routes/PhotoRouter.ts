import { Router } from "express";
import multer from "multer";
import { photoController } from "../controllers/PhotoController";
import { adminAuth } from "../middleware/adminAuth";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export const photoRouter = Router();

photoRouter.get("/", photoController.index);
photoRouter.post("/", adminAuth, upload.single("image"), photoController.create);

// Reações e comentários (públicos)
photoRouter.post("/:id/reactions", photoController.addReaction);
photoRouter.delete("/:id/reactions", photoController.removeReaction);
photoRouter.post("/:id/comments", photoController.addComment);
