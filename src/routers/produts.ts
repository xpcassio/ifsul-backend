import express, { Request, Response, Router } from "express";
import { PrismaClient, Prisma } from "../generated/prisma";
import { z, ZodError } from "zod";
import path from "path";
import { create } from "domain";
import { AuthRequest, productSchema, productUpdateSchema } from "../schema";
import authMiddleware from "./middleware";

const routesProducts = express.Router();
const prisma = new PrismaClient();

routesProducts.get("/products", async (_req: Request, res: Response) => {
  try {
    const produtos = await prisma.product.findMany();
    return res.status(200).json(produtos);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao listar produtos." });
  }
});

routesProducts.get("/products/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0)
    return res
      .status(400)
      .json({ message: "ID inválido. Deve ser um número inteiro positivo." });

  try {
    const produto = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!produto)
      return res.status(404).json({ message: "Produto não encontrado." });

    return res.status(200).json(produto);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar produto." });
  }
});

routesProducts.post(
  "/products",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const data = productSchema.parse(req.body);
      const novoProduto = await prisma.product.create({ data });
      return res.status(201).json({
        message: "Produto criado com sucesso.",
        novoProduto,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Payload invalido.",
          issue: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }

      return res.status(500).json({ message: "Erro ao criar produto." });
    }
  }
);

routesProducts.put(
  "/products/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0)
      return res
        .status(400)
        .json({ message: "ID inválido. Deve ser um número inteiro positivo." });

    try {
      const data = productUpdateSchema.parse(req.body);
      const updated = await prisma.product.update({ where: { id }, data });
      return res.status(200).json({
        message: "Produto editado com sucesso.",
        updated,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Payload invalido.",
          issue: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Produto não encontrado." });
      }

      return res.status(500).json({ message: "Erro ao atualizar produto." });
    }
  }
);

routesProducts.delete(
  "/products/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0)
      return res
        .status(400)
        .json({ message: "ID inválido. Deve ser um número inteiro positivo." });

    try {
      await prisma.product.delete({ where: { id } });
      return res.status(204).json({
        message: "Produto deletado com sucesso.",
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ message: "Produto não encontrado." });
      }

      return res.status(500).json({ message: "Erro ao deletar produto." });
    }
  }
);

export default routesProducts;
