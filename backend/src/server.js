require("dotenv").config();

const app = require("./app");
const { pool } = require("./db/pool");

const port = Number.parseInt(process.env.PORT || "4000", 10);

if (
  !process.env.DATABASE_URL &&
  (!process.env.PGHOST ||
    !process.env.PGUSER ||
    !process.env.PGPASSWORD ||
    !process.env.PGDATABASE)
) {
  throw new Error(
    "Configure DATABASE_URL or all of PGHOST, PGUSER, PGPASSWORD, and PGDATABASE."
  );
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters.");
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}

async function ensurePortalSchema() {
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT FALSE`);
  await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ`);
  await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deployment_location TEXT`);
}

let server;

ensurePortalSchema()
  .then(() => {
    server = app.listen(port, () => {
      console.log(`EquipShare API listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to apply portal schema updates:", error);
    process.exit(1);
  });

async function shutDown(signal) {
  console.log(`${signal} received; closing the API server.`);
  if (!server) {
    try {
      await pool.end();
    } catch (_error) {}
    process.exit(0);
    return;
  }
  server.close(async (serverError) => {
    try {
      await pool.end();
    } catch (poolError) {
      console.error("Failed to close the PostgreSQL pool:", poolError);
      process.exitCode = 1;
    }

    if (serverError) {
      console.error("Failed to close the API server:", serverError);
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", () => shutDown("SIGINT"));
process.on("SIGTERM", () => shutDown("SIGTERM"));
