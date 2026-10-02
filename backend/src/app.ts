import express from "express";
import cors from "cors";

import { memoryRouter } from "./routes/MemoryRouter";
import { guestbookRouter } from "./routes/GuestbookRouter";
import { pollRouter } from "./routes/PollRouter";
import { photoRouter } from "./routes/PhotoRouter";

export const app = express();

const frontendUrl = process.env.FRONTEND_URL;

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? frontendUrl
        : "http://localhost:5173",
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  return res.json({
    message: "API Baby Antonopoulos ❤️",
  });
});

app.get("/health", (_req, res) => {
  return res.json({
    status: "ok",
  });
});

app.use("/api/memories", memoryRouter);
app.use("/api/guestbook", guestbookRouter);
app.use("/api/poll", pollRouter);
app.use("/api/photos", photoRouter);
