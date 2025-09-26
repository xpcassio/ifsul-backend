import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from './generated/prisma';
import { z, ZodError } from 'zod';
import path from 'path';
import { create } from 'domain';
import { productSchema, productUpdateSchema } from './schema';

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: 'htto://localhost:5173' }));
app.use(express.json());

// Define the port the server will listen on
const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

app.get("/products", async (_req: Request, res: Response) => {
    try {
        const produtos = await prisma.product.findMany();
        return res.status(200).json(produtos);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao listar produtos." });
    }
});

app.get("/products/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0)
        return res.status(400).json({ message: "ID inválido. Deve ser um número inteiro positivo." });

    try {
        const produto = await prisma.product.findUnique({
            where: { id: id }
        });

        if (!produto)
            return res.status(404).json({ message: "Produto não encontrado." });

        return res.status(200).json(produto);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar produto." });
    }
});

app.post("/products", async (req: Request, res: Response) => {
    try {
        const data = productSchema.parse(req.body);
        const novoProduto = await prisma.product.create({ data });
        return res.status(201).json(novoProduto);
    }
    catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: 'Payload invalido.',
                issue: error.issues.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message
                })),
            });
        }

        return res.status(500).json({ message: "Erro ao criar produto." });
    }
});

app.put("/products/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0)
        return res.status(400).json({ message: "ID inválido. Deve ser um número inteiro positivo." });

    try {
        const data = productUpdateSchema.parse(req.body);
        const updated = await prisma.product.update({ where: { id }, data });
        return res.status(200).json(updated);
    }
    catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: 'Payload invalido.',
                issue: error.issues.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message
                })),
            });
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ message: "Produto não encontrado." });
        }

        return res.status(500).json({ message: "Erro ao atualizar produto." });
    }
});

app.delete("/products/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0)
        return res.status(400).json({ message: "ID inválido. Deve ser um número inteiro positivo." });

    try {
        await prisma.product.delete({ where: { id } });
        return res.status(204).send();
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ message: "Produto não encontrado." });
        }

        return res.status(500).json({ message: "Erro ao deletar produto." });
    }
});
