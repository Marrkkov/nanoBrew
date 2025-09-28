import { Router } from "express";
import db from "./db";
import bcrypt from "bcryptjs";
import { requireAuth, requireAdmin, signToken } from "./auth";

const r = Router();

/** Row shapes we read from SQLite */
type UserRow = { id: number; pw_hash: string };
type PwHashRow = { pw_hash: string };
type ValRow = { v: number };
type TotalsRow = { qty_500: number; qty_250: number; qty_bottle: number };
type OverviewRow = {
  username: string;
  qty_500: number;
  qty_250: number;
  qty_bottle: number;
  grand: number;
};

// --- Auth ---
r.post("/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, msg: "Required" });
  }

  const row = db
    .prepare("SELECT id, pw_hash FROM users WHERE username = ?")
    .get(username) as UserRow | undefined;

  if (!row || !bcrypt.compareSync(password, row.pw_hash)) {
    return res.status(401).json({ ok: false, msg: "Invalid credentials" });
  }

  const token = signToken({ uid: row.id, username });
  return res.json({ ok: true, token, username });
});

r.post("/auth/change-password", requireAuth as any, (req: any, res) => {
  const { current, next } = req.body || {};
  if (!current || !next) {
    return res.status(400).json({ ok: false, msg: "Required" });
  }

  const row = db
    .prepare("SELECT pw_hash FROM users WHERE id=?")
    .get(req.user.uid) as PwHashRow | undefined;

  if (!row || !bcrypt.compareSync(current, row.pw_hash)) {
    return res
      .status(400)
      .json({ ok: false, msg: "Current password is incorrect" });
  }
  if (String(next).length < 4) {
    return res.status(400).json({ ok: false, msg: "New password too short" });
  }

  const hash = bcrypt.hashSync(next, 10);
  db.prepare("UPDATE users SET pw_hash=? WHERE id=?").run(hash, req.user.uid);
  return res.json({ ok: true });
});

// --- Admin: add user ---
r.post(
  "/admin/add-user",
  requireAuth as any,
  requireAdmin as any,
  (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res
        .status(400)
        .json({ ok: false, msg: "Username and password required" });
    }
    try {
      const hash = bcrypt.hashSync(password, 10);
      const info = db
        .prepare("INSERT INTO users(username, pw_hash) VALUES(?,?)")
        .run(String(username).toLowerCase(), hash);
      db.prepare("INSERT INTO sales_totals(user_id) VALUES(?)").run(
        info.lastInsertRowid as number
      );
      return res.json({ ok: true });
    } catch (e: any) {
      if (String(e?.message || "").includes("UNIQUE")) {
        return res
          .status(400)
          .json({ ok: false, msg: "Username already exists" });
      }
      return res.status(500).json({ ok: false, msg: "Error creating user" });
    }
  }
);

// --- Sales update & totals ---
r.post("/sales/update", requireAuth as any, (req: any, res) => {
  const { item, delta } = req.body || {};
  if (!["500", "250", "bottle"].includes(item) || ![1, -1].includes(delta)) {
    return res.status(400).json({ ok: false, msg: "Bad request" });
  }
  const col =
    item === "500" ? "qty_500" : item === "250" ? "qty_250" : "qty_bottle";

  const cur = db
    .prepare(`SELECT ${col} AS v FROM sales_totals WHERE user_id=?`)
    .get(req.user.uid) as ValRow | undefined;

  const newV = Math.max(0, (cur?.v ?? 0) + delta);
  db.prepare(
    `UPDATE sales_totals SET ${col}=?, updated_at=datetime('now') WHERE user_id=?`
  ).run(newV, req.user.uid);

  return res.json({ ok: true });
});

r.get("/sales/my-totals", requireAuth as any, (req: any, res) => {
  const t = db
    .prepare(
      "SELECT qty_500, qty_250, qty_bottle FROM sales_totals WHERE user_id=?"
    )
    .get(req.user.uid) as TotalsRow | undefined;

  const totals = t ?? { qty_500: 0, qty_250: 0, qty_bottle: 0 };
  const grand = totals.qty_500 + totals.qty_250 + totals.qty_bottle;
  return res.json({ ok: true, totals: { ...totals, grand } });
});

// Public overview (or protect if you prefer)
r.get("/sales/overview", (_req, res) => {
  const rows = db
    .prepare(
      `
      SELECT u.username, s.qty_500, s.qty_250, s.qty_bottle,
             (s.qty_500 + s.qty_250 + s.qty_bottle) AS grand
      FROM users u
      JOIN sales_totals s ON s.user_id = u.id
      ORDER BY grand DESC, u.username ASC
    `
    )
    .all() as OverviewRow[];

  const grand = rows.reduce(
    (acc, r) => {
      acc.qty_500 += r.qty_500;
      acc.qty_250 += r.qty_250;
      acc.qty_bottle += r.qty_bottle;
      acc.grand += r.grand;
      return acc;
    },
    { qty_500: 0, qty_250: 0, qty_bottle: 0, grand: 0 }
  );

  return res.json({ ok: true, rows, grand });
});

export default r;
