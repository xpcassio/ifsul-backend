import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

async function test() {
  try {
    const products = await prisma.product.findMany();
    console.log("Produtos encontrados:", products.length);
    console.table(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

test();