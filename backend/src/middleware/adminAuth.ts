import type { Request, Response, NextFunction } from "express";

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_SECRET;

  if (!expected) {
    return res.status(500).json({
      error: "ADMIN_SECRET não configurado no servidor.",
    });
  }

  const provided = req.header("x-admin-secret");

  if (!provided || provided !== expected) {
    return res.status(401).json({ error: "Senha inválida." });
  }

  return next();
}
