import express, { Request, Response } from "express";
import cors from "cors";
import routesUsers from "./routers/users";
import authMiddleware from "./routers/middleware";
import routesProducts from "./routers/produts";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use(routesUsers);
app.use(routesProducts);

// Define the port the server will listen on
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});
