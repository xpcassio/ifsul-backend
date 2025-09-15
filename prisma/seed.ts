// seed.ts
import products from "../mock/products.json";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
    console.log("Iniciando o seeding do banco de dados...");

    // Remove todos os registros existentes na tabela Product
    await prisma.product.deleteMany();

    // Mapeia os produtos do JSON para o formato do banco e insere em lote
    const createData = products.map((p: any) => ({
        // se os ids do JSON forem do tipo string como "p1", "p2", mantemos o id
        id: p.id,
        title: p.title,
        description: p.description,
        price: Number(p.price),
        imageUrl: p.imageUrl,
        isFeatured: Boolean(p.isFeatured),
    }));

    // Usa createMany se quiser inserção em lote (mais rápido). Note que
    // createMany não executa middlewares e não retorna os registros criados.
    await prisma.product.createMany({
        data: createData,
        skipDuplicates: true,
    });
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
})
.finally(async () => {
    console.log("Seeding finalizado.");
    await prisma.$disconnect();
});
