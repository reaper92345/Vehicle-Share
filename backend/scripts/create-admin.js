require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { pool } = require('../src/db/pool');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const password = process.env.ADMIN_PASSWORD;
    const email = process.env.ADMIN_EMAIL;
    const fullName = process.env.ADMIN_FULL_NAME || 'Admin User';
    const phone = process.env.ADMIN_PHONE || '0000000000';
    const userType = 'admin'; // admin role

    if (!password || !email) {
      throw new Error('ADMIN_PASSWORD and ADMIN_EMAIL environment variables must be set');
    }

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
