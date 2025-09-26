import { z } from 'zod';

export const productSchema = z.object({
    title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres.'),
    description: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres.'),
    price: z.coerce.number().positive('O preço deve ser maior que zero.'),
    imageUrl: z.string().min(1, 'Imagem não pode ser vazio.'),
    isFeatured: z.coerce.boolean().optional().default(false),
});

export const productUpdateSchema = productSchema.partial();