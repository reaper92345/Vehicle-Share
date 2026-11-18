const { pool } = require("./pool");

/**
 * Runs safe, idempotent migrations on application startup.
 * Ensures the database schema is up-to-date even when running on existing Docker volumes.
 */
async function runStartupMigrations() {
  console.log("[DB Migration] Checking database schema...");

  // 1. Users table migrations
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  // 2. Equipment table migrations (quantity, lat, lng)
  await pool.query(`
    ALTER TABLE equipment ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1);
    ALTER TABLE equipment ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6);
    ALTER TABLE equipment ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6);
    CREATE INDEX IF NOT EXISTS equipment_coordinates_idx ON equipment (latitude, longitude) WHERE is_available = TRUE;
  `);

  // 3. Bookings table migrations
  await pool.query(`
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deployment_location TEXT;
  `);

  console.log("[DB Migration] Schema is verified and up-to-date.");
}

module.exports = { runStartupMigrations };
