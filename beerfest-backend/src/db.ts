import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const db = new Database("beerfest.sqlite3");
db.pragma("journal_mode = WAL");

// ---------- schema ----------
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  pw_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sales_totals (
  user_id INTEGER PRIMARY KEY,
  qty_500 INTEGER NOT NULL DEFAULT 0,
  qty_250 INTEGER NOT NULL DEFAULT 0,
  qty_bottle INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

// ---------- helpers ----------
const insertUser = db.prepare(
  "INSERT OR IGNORE INTO users(username, pw_hash) VALUES(?, ?)"
);
const ensureTotals = db.prepare(
  `INSERT OR IGNORE INTO sales_totals(user_id)
   SELECT id FROM users WHERE username = ?`
);

// everyone (non-admin) uses password "123"
const SHARED_HASH = bcrypt.hashSync("123", 10);

// ---------- seed admin first time ----------
const countRow = db.prepare("SELECT COUNT(*) AS c FROM users").get() as {
  c: number;
};
if (countRow.c === 0) {
  const adminHash = bcrypt.hashSync("admin", 10);
  insertUser.run("admin", adminHash);
  ensureTotals.run("admin");
  console.log("Seeded admin/admin");
}

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

const tx = db.transaction((names: string[]) => {
  for (const name of names) {
    const u = name.trim();
    if (!u) continue;
    insertUser.run(u, SHARED_HASH);
    ensureTotals.run(u);
  }
});
tx(BREWERIES);

// OPTIONAL: force-reset all listed breweries to password "123" each run
// (skip admin). Uncomment if you want to overwrite existing passwords too.
// db.prepare(
//   `UPDATE users SET pw_hash=? WHERE username IN (${BREWERIES.map(() => '?').join(',')}) AND username <> 'admin'`
// ).run(SHARED_HASH, ...BREWERIES);

console.log(
  `Seeded/ensured ${BREWERIES.length} brewery accounts (password "123").`
);

export default db;
