
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// ---------------------------------------------------------------------------
// Parse command‑line arguments
// ---------------------------------------------------------------------------
const argv = yargs(hideBin(process.argv))
  .option('email', {
    alias: 'e',
    type: 'string',
    demandOption: true,
    describe: 'Admin e‑mail address (must be unique)',
  })
  .option('password', {
    alias: 'p',
    type: 'string',
    demandOption: true,
    describe: 'Plain‑text password (will be hashed)',
  })
  .option('full_name', {
    alias: 'n',
    type: 'string',
    demandOption: true,
    describe: 'Full name for the admin user',
  })
  .help()
  .argv;

// ---------------------------------------------------------------------------
// Load .env (project root) – same file used by docker‑compose
// ---------------------------------------------------------------------------
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// ---------------------------------------------------------------------------
// Basic validation
// ---------------------------------------------------------------------------
function isValidEmail(email) {
  // Very simple RFC‑5322‑compatible regex – enough for dev purposes
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
if (!isValidEmail(argv.email)) {
  console.error('❌ Invalid e‑mail address.');
  process.exit(1);
}
if (argv.password.length < 8) {
  console.error('❌ Password must be at least 8 characters.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Set up PG pool (uses env vars: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE)
// ---------------------------------------------------------------------------
const pool = new Pool({
  host: process.env.PGHOST === 'db' ? 'localhost' : process.env.PGHOST,
  port: parseInt(process.env.PGPORT, 10),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

// ---------------------------------------------------------------------------
// Main async routine
// ---------------------------------------------------------------------------
(async () => {
  try {
    const hashed = await bcrypt.hash(argv.password, 12);

    const insertQuery = `
      INSERT INTO users (full_name, email, phone_number, password_hash, user_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, full_name, email, user_type, created_at;
    `;

    // Phone number is optional for our admin script – we’ll store a placeholder.
    const placeholderPhone = '0000000000';

    const { rows } = await pool.query(insertQuery, [
      argv.full_name.trim(),
      argv.email.trim().toLowerCase(),
      placeholderPhone,
      hashed,
      'admin', // <-- user_type = admin
    ]);

    const user = rows[0];
    console.log('✅ Admin user created:');
    console.log(`   ID:         ${user.id}`);
    console.log(`   Full name:  ${user.full_name}`);
    console.log(`   E‑mail:     ${user.email}`);
    console.log(`   Type:       ${user.user_type}`);
    console.log(`   Created at: ${user.created_at}`);
  } catch (err) {
    if (err.code === '23505') {
      console.error('❌ A user with that e‑mail already exists.');
    } else {
      console.error('❌ Unexpected error:', err.message);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
