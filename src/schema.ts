import { Request } from "express";
import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(3, "O título deve ter no mínimo 3 caracteres."),
  description: z
    .string()
    .min(10, "A descrição deve ter no mínimo 10 caracteres."),
  price: z.coerce.number().positive("O preço deve ser maior que zero."),
  imageUrl: z.string().min(1, "Imagem não pode ser vazio."),
  isFeatured: z.coerce.boolean().optional().default(false),
});

export const productUpdateSchema = productSchema.partial();

export const registerSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Should be at least 6 characters long"),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name?: string | null;
  };
}
