//import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes";
import { initDb, pool } from "./db";

const PORT = Number(process.env.PORT || 4000);

async function main() {
  await initDb();

  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api", routes);

  app.get("/health/db", async (_req, res) => {
    try {
      const [rows] = await pool.query("SELECT 1+1 AS two");
      res.json({ ok: true, rows });
    } catch (e: any) {
      console.error("DB health error:", e);
      res.status(500).json({
        ok: false,
        code: e?.code,
        errno: e?.errno,
        sqlState: e?.sqlState,
        message: e?.message,
      });
    }
  });

  app.get("/health/plain", (_req, res) => {
    res.type("text/plain").send("OK");
  });

  app.get("/debug/env", (_req, res) => {
    // TEMPORARY: do not keep in prod
    const pick = (k: string) => process.env[k] ?? "(unset)";
    res.json({
      NODE_ENV: pick("NODE_ENV"),
      PORT: pick("PORT"),
      DB_HOST: pick("DB_HOST"),
      DB_PORT: pick("DB_PORT"),
      DB_NAME: pick("DB_NAME"),
      DB_USER: pick("DB_USER"),
    });
  });

  app.get("/health/plain", (_req, res) => {
    res.type("text/plain").send("OK");
  });

  app.listen(PORT, () => console.log(`API on :${PORT}`));
}

main().catch((err) => {
  console.error("Fatal init error:", err);
  process.exit(1);
});
