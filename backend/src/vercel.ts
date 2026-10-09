// Ponto de entrada da API quando roda como função serverless na Vercel
// (empacotado por frontend/scripts/vercel-build.sh).
import type { IncomingMessage, ServerResponse } from "node:http";
import { app } from "./app";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // A rota da Vercel manda /api/<resto> para esta função como /api?__p=<resto>.
  // Reconstruímos a URL original para o Express rotear normalmente.
  const url = new URL(req.url ?? "/", "http://localhost");
  const p = url.searchParams.get("__p");
  url.searchParams.delete("__p");
  if (p !== null && !url.pathname.startsWith("/api/")) {
    url.pathname = `/api/${p}`;
  }
  req.url = url.pathname + url.search;

  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
