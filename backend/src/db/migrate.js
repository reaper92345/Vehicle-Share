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

  // Backfill existing equipment with default coordinates based on their location text
  await pool.query(`
    UPDATE equipment SET
      latitude = CASE
        WHEN LOWER(location) LIKE '%bhaktapur%' THEN 27.6698
        WHEN LOWER(location) LIKE '%kathmandu%' THEN 27.7172
        WHEN LOWER(location) LIKE '%lalitpur%' THEN 27.6710
        WHEN LOWER(location) LIKE '%pokhara%' THEN 28.2096
        WHEN LOWER(location) LIKE '%chitwan%' THEN 27.6934
        WHEN LOWER(location) LIKE '%butwal%' THEN 27.7006
        WHEN LOWER(location) LIKE '%bhairahawa%' THEN 27.5045
        WHEN LOWER(location) LIKE '%hetauda%' THEN 27.4287
        WHEN LOWER(location) LIKE '%biratnagar%' THEN 26.4525
        WHEN LOWER(location) LIKE '%dhading%' THEN 27.8722
        WHEN LOWER(location) LIKE '%kavre%' THEN 27.6253
        WHEN LOWER(location) LIKE '%surkhet%' THEN 28.6019
        ELSE 27.7172
      END,
      longitude = CASE
        WHEN LOWER(location) LIKE '%bhaktapur%' THEN 85.4385
        WHEN LOWER(location) LIKE '%kathmandu%' THEN 85.3240
        WHEN LOWER(location) LIKE '%lalitpur%' THEN 85.3206
        WHEN LOWER(location) LIKE '%pokhara%' THEN 83.9856
        WHEN LOWER(location) LIKE '%chitwan%' THEN 84.4300
        WHEN LOWER(location) LIKE '%butwal%' THEN 83.4484
        WHEN LOWER(location) LIKE '%bhairahawa%' THEN 83.4500
        WHEN LOWER(location) LIKE '%hetauda%' THEN 85.0328
        WHEN LOWER(location) LIKE '%biratnagar%' THEN 87.2718
        WHEN LOWER(location) LIKE '%dhading%' THEN 84.8989
        WHEN LOWER(location) LIKE '%kavre%' THEN 85.5561
        WHEN LOWER(location) LIKE '%surkhet%' THEN 81.6338
        ELSE 85.3240
      END
    WHERE latitude IS NULL OR longitude IS NULL;
  `);

  // 3. Bookings table migrations
  await pool.query(`
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deployment_location TEXT;
  `);

  console.log("[DB Migration] Schema is verified and up-to-date.");
}

module.exports = { runStartupMigrations };
