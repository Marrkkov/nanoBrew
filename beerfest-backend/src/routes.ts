// src/routes.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import { requireAuth, requireAdmin, signToken } from "./auth";
import { get, all, run } from "./db";

const r = Router();

/** Row shapes we read from MySQL */
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
r.post("/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, msg: "Required" });
  }

  const row = await get<UserRow>(
    "SELECT id, pw_hash FROM users WHERE username = ? LIMIT 1",
    [username]
  );

  if (!row || !(await bcrypt.compare(password, row.pw_hash))) {
    return res.status(401).json({ ok: false, msg: "Invalid credentials" });
  }

  const token = signToken({ uid: row.id, username });
  return res.json({ ok: true, token, username });
});

r.post("/auth/change-password", requireAuth as any, async (req: any, res) => {
  const { current, next } = req.body || {};
  if (!current || !next) {
    return res.status(400).json({ ok: false, msg: "Required" });
  }

  const row = await get<PwHashRow>(
    "SELECT pw_hash FROM users WHERE id=? LIMIT 1",
    [req.user.uid]
  );

  if (!row || !(await bcrypt.compare(current, row.pw_hash))) {
    return res
      .status(400)
      .json({ ok: false, msg: "Current password is incorrect" });
  }
  if (String(next).length < 4) {
    return res.status(400).json({ ok: false, msg: "New password too short" });
  }

  const hash = await bcrypt.hash(next, 10);
  await run("UPDATE users SET pw_hash=? WHERE id=?", [hash, req.user.uid]);
  return res.json({ ok: true });
});

// --- Auth: breweries list (exclude admin) ---
r.get("/auth/breweries", async (_req, res) => {
  const rows = await all<{ username: string }>(
    "SELECT username FROM users WHERE LOWER(username) <> 'admin' ORDER BY username ASC"
  );
  return res.json({ ok: true, breweries: rows.map((r) => r.username) });
});

// --- Admin: add user ---
r.post(
  "/admin/add-user",
  requireAuth as any,
  requireAdmin as any,
  async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res
        .status(400)
        .json({ ok: false, msg: "Username and password required" });
    }
    try {
      const uname = String(username).toLowerCase();
      const hash = await bcrypt.hash(password, 10);

      const info = await run(
        "INSERT INTO users(username, pw_hash) VALUES(?,?)",
        [uname, hash]
      );

      await run("INSERT IGNORE INTO sales_totals(user_id) VALUES(?)", [
        info.insertId,
      ]);
      return res.json({ ok: true });
    } catch (e: any) {
      if (e?.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ ok: false, msg: "Username already exists" });
      }
      return res.status(500).json({ ok: false, msg: "Error creating user" });
    }
  }
);

// --- Sales update & totals ---
r.post("/sales/update", requireAuth as any, async (req: any, res) => {
  const { item, delta } = req.body || {};
  if (!["500", "250", "bottle"].includes(item) || ![1, -1].includes(delta)) {
    return res.status(400).json({ ok: false, msg: "Bad request" });
  }
  const col =
    item === "500" ? "qty_500" : item === "250" ? "qty_250" : "qty_bottle";

  const cur = await get<ValRow>(
    `SELECT ${col} AS v FROM sales_totals WHERE user_id=? LIMIT 1`,
    [req.user.uid]
  );

  const newV = Math.max(0, (cur?.v ?? 0) + delta);
  await run(
    `UPDATE sales_totals
     SET ${col}=?, updated_at=NOW()
     WHERE user_id=?`,
    [newV, req.user.uid]
  );

  return res.json({ ok: true });
});

r.get("/sales/my-totals", requireAuth as any, async (req: any, res) => {
  const t = await get<TotalsRow>(
    "SELECT qty_500, qty_250, qty_bottle FROM sales_totals WHERE user_id=? LIMIT 1",
    [req.user.uid]
  );

  const totals = t ?? { qty_500: 0, qty_250: 0, qty_bottle: 0 };
  const grand = totals.qty_500 + totals.qty_250 + totals.qty_bottle;
  return res.json({ ok: true, totals: { ...totals, grand } });
});

// Public overview (or protect if you prefer)
r.get("/sales/overview", async (_req, res) => {
  const rows = await all<OverviewRow>(
    `
    SELECT u.username,
           s.qty_500, s.qty_250, s.qty_bottle,
           (s.qty_500 + s.qty_250 + s.qty_bottle) AS grand
    FROM users u
    JOIN sales_totals s ON s.user_id = u.id
    WHERE u.username <> 'admin'
    ORDER BY grand DESC, u.username ASC
    `
  );

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

r.post(
  "/admin/reset-totals",
  requireAuth as any,
  requireAdmin as any,
  async (_req, res) => {
    await run(
      "UPDATE sales_totals SET qty_500=0, qty_250=0, qty_bottle=0, updated_at=NOW()",
      []
    );
    return res.json({ ok: true });
  }
);

export default r;
