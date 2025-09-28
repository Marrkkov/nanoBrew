import express from "express";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes";

const PORT = Number(process.env.PORT || 4000);

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", routes);

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
