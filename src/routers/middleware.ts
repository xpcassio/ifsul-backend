import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../schema";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (_req: AuthRequest, res: Response, next: any) => {
  try {
    const authHeader = _req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token invalid format" });
    }

    const decoded = jwt.verify(token, JWT_SECRET!) as unknown as {
      userId: number;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    _req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

export default authMiddleware;
