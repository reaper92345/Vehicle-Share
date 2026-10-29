const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { pool } = require("../src/db/pool");

async function run() {
  const sqlPath = path.join(__dirname, "..", "sql", "migrations", "001_role_portals.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  await pool.query(sql);
  console.log("Applied 001_role_portals.sql");
  await pool.end();
}

run().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
