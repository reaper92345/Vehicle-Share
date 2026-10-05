require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { pool } = require('../src/db/pool');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const password = 'AdminPass!2023';
    const email = 'langoor92345@gmail.com';
    const fullName = 'Admin User';
    const phone = '9789124352';
    const userType = 'owner'; // can be 'owner', 'renter', or 'both'

    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO users (full_name, email, phone_number, password_hash, user_type)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE
       SET full_name = EXCLUDED.full_name,
           phone_number = EXCLUDED.phone_number,
           password_hash = EXCLUDED.password_hash,
           user_type = EXCLUDED.user_type`,
      [fullName, email, phone, passwordHash, userType]
    );
    console.log('Admin account created or credentials updated.');
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
