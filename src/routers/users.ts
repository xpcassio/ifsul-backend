import express, { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import z, { ZodError } from "zod";
import { loginSchema, registerSchema } from "../schema";
import authMiddleware from "./middleware";

const routesUsers = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

routesUsers.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET!, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user.id, email: user.email, name: user.name },
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

    res.status(500).json({ error: "Internal server error" });
  }
});

routesUsers.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return res.status(401).json({ error: "Email or key incorrect" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Email or key incorrect" });
    }

    const token = jwt.sign({ userId: existingUser.id }, JWT_SECRET!, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      },
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

    res.status(500).json({ error: "Internal server error" });
  }
});

routesUsers.get("/auth/me", authMiddleware, (req: Request, res: Response) => {
  return res.status(200).json({
    message: "User authenticated successfully",
    user: req.user,
  });
});

export default routesUsers;
