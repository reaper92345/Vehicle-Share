// Diagnostic script - run from backend dir with: node check-diag.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
// Also load root .env for real PGPASSWORD/credentials (backend/.env may have placeholder)
require('dotenv').config({ path: path.join(__dirname, '../.env') });
// Force localhost since we're running directly (not via Docker)
process.env.PGHOST = 'localhost';
// Map POSTGRES_* vars to PG* vars that pool.js expects
if (!process.env.PGPASSWORD && process.env.POSTGRES_PASSWORD) process.env.PGPASSWORD = process.env.POSTGRES_PASSWORD;
if (!process.env.PGDATABASE && process.env.POSTGRES_DB) process.env.PGDATABASE = process.env.POSTGRES_DB;
if (!process.env.PGUSER && process.env.POSTGRES_USER) process.env.PGUSER = process.env.POSTGRES_USER;
if (!process.env.PGHOST && process.env.POSTGRES_HOST) process.env.PGHOST = process.env.POSTGRES_HOST;
const { pool } = require('./src/db/pool');

async function check() {
  const users = await pool.query('SELECT id, full_name, user_type FROM users ORDER BY id');
  console.log('Users:');
  users.rows.forEach(u => console.log(`  id=${u.id} (${typeof u.id}) user_type=${u.user_type} name=${u.full_name}`));

  const equip = await pool.query('SELECT id, title, owner_id FROM equipment');
  console.log('\nEquipment:');
  equip.rows.forEach(e => console.log(`  id=${e.id} owner_id=${e.owner_id} (${typeof e.owner_id}) title=${e.title}`));

  const bookings = await pool.query('SELECT id, equipment_id, renter_id, status FROM bookings');
  console.log('\nBookings:');
  bookings.rows.forEach(b => console.log(`  id=${b.id} equip_id=${b.equipment_id} renter_id=${b.renter_id} status=${b.status}`));

  const owner = users.rows.find(u => u.user_type === 'owner');
  if (!owner) { console.log('\nNO OWNER FOUND!'); await pool.end(); return; }

  console.log(`\nTesting with owner id=${owner.id} as STRING "${String(owner.id)}":`);
  const resStr = await pool.query(
    `SELECT b.id, b.status, e.owner_id FROM bookings b
     JOIN equipment e ON e.id = b.equipment_id WHERE e.owner_id = $1`,
    [String(owner.id)]
  );
  console.log(`  Rows (string param): ${resStr.rowCount}`);

  console.log(`Testing with owner id=${owner.id} as INTEGER:`);
  const resInt = await pool.query(
    `SELECT b.id, b.status, e.owner_id FROM bookings b
     JOIN equipment e ON e.id = b.equipment_id WHERE e.owner_id = $1`,
    [owner.id]
  );
  console.log(`  Rows (int param): ${resInt.rowCount}`);
  resInt.rows.forEach(r => console.log('   ', JSON.stringify(r)));

  await pool.end();
}

check().catch(e => { console.error('ERROR:', e.message, e.stack); process.exit(1); });
