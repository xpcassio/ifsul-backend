import express, { Request, Response } from 'express';
import products from "../mock/products.json";

const app = express();

// Define the port the server will listen on
const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

app.get("/products", (_req, res) => {
    res.json(products);
});

app.get("/products/:id", (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ message: "Produto não encontrado" });
  res.json(product);
});

app.delete("/products/:id", (req, res) => {
    const index = products.findIndex(p => p.id === Number(req.params.id));
    if (index === -1) {
        return res.status(404).json({ message: "Produto não encontrado" });
    }
    products.splice(index, 1);
    res.json({ message: "Produto removido com sucesso" });
});
