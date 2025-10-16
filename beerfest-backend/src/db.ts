// src/db.ts
import mysql, { ResultSetHeader } from "mysql2/promise";
import bcrypt from "bcryptjs";

const {
  DB_HOST = "localhost",
  DB_PORT = "3306",
  DB_NAME = "wehaveto_beermut",
  DB_USER = "root",
  DB_PASS = "",
} = process.env;

// --- Connection pool ---
export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// --- Small helpers to mimic get/all/run ---
export async function get<T = any>(sql: string, params: any[] = []) {
  const [rows] = await pool.query(sql, params);
  const arr = rows as any[];
  return (arr?.[0] as T) ?? undefined;
}

export async function all<T = any>(sql: string, params: any[] = []) {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

export async function run(sql: string, params: any[] = []) {
  const [res] = await pool.execute(sql, params);
  return res as ResultSetHeader;
}

// ---------- schema & seed ----------
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  pw_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sales_totals (
  user_id INT NOT NULL,
  qty_500 INT NOT NULL DEFAULT 0,
  qty_250 INT NOT NULL DEFAULT 0,
  qty_bottle INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_sales_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

const BREWERIES: string[] = [
  "Sin Rodeo",
  "Slurry brew",
  "Cupercito's Company",
  "El Faro",
  "Codigo brew",
  "Trabalenguas",
  "San Gregorio",
  "Proton",
  "Canini",
  "Skell",
  "Edom",
  "Brebajes Salvajes",
  "Buenavista",
];

export async function initDb() {
  // Create tables
  for (const stmt of SCHEMA.split(";")
    .map((s) => s.trim())
    .filter(Boolean)) {
    await run(stmt);
  }

  // Ensure admin exists
  const admin = await get<{ id: number }>(
    "SELECT id FROM users WHERE username=? LIMIT 1",
    ["admin"]
  );

  let adminId: number;
  if (!admin) {
    const hash = bcrypt.hashSync("admin", 10);
    const res = await run(
      "INSERT INTO users (username, pw_hash) VALUES (?, ?)",
      ["admin", hash]
    );
    adminId = res.insertId;
  } else {
    adminId = admin.id;
  }

  // Shared brewery password "123"
  const sharedHash = bcrypt.hashSync("123", 10);

  // Upsert breweries & create sales rows
  for (const name of BREWERIES) {
    // Ensure user row
    let row = await get<{ id: number }>(
      "SELECT id FROM users WHERE username=? LIMIT 1",
      [name]
    );
    if (!row) {
      const res = await run(
        "INSERT INTO users (username, pw_hash) VALUES (?, ?)",
        [name, sharedHash]
      );
      row = { id: res.insertId };
    }

    // Ensure sales_totals row
    await run(
      "INSERT IGNORE INTO sales_totals (user_id, qty_500, qty_250, qty_bottle) VALUES (?, 0, 0, 0)",
      [row.id]
    );
  }

  console.log(
    `DB ready. Admin id=${adminId}. Ensured ${BREWERIES.length} brewery accounts (password "123").`
  );
}
