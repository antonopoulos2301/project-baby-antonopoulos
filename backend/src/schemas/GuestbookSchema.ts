import { z } from "zod";

export const createGuestbookMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(80, "O nome deve possuir no máximo 80 caracteres."),

  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .max(254, "O e-mail informado é muito grande."),

  message: z
    .string()
    .trim()
    .min(5, "A mensagem deve possuir pelo menos 5 caracteres.")
    .max(1000, "A mensagem deve possuir no máximo 1000 caracteres."),
});

export type CreateGuestbookMessageInput = z.infer<
  typeof createGuestbookMessageSchema
>;
