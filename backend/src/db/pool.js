const { Pool } = require("pg");

// Provide sensible defaults for local development when .env does not define PG* variables.
process.env.PGHOST = process.env.PGHOST || "localhost";
process.env.PGPORT = process.env.PGPORT || "5432";
process.env.PGUSER = process.env.PGUSER || "postgres";
process.env.PGPASSWORD = process.env.PGPASSWORD || "EquipShare-Local-Database-Password-Change-Me";
process.env.PGDATABASE = process.env.PGDATABASE || "postgres";
process.env.PGSSL = process.env.PGSSL || "false";

const connectionConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    };

const pool = new Pool({
  ...connectionConfig,
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: true } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

module.exports = { pool };
