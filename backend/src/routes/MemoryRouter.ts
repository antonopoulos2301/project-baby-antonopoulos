import { Router } from "express";
import multer from "multer";
import { memoryController } from "../controllers/MemoryController";
import { adminAuth } from "../middleware/adminAuth";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export const memoryRouter = Router();

memoryRouter.get("/", memoryController.index);

memoryRouter.post("/", adminAuth, upload.single("image"), memoryController.create);
