// User controller for admin operations
const { pool } = require('../db/pool');
const { asyncHandler } = require('../utils/async-handler');
const { isNonEmptyString, isValidEmail } = require('../utils/validation');

// List all users (admin only)
const listUsers = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, phone_number, user_type, created_at FROM users ORDER BY created_at DESC`
  );
  res.status(200).json({ users: rows });
});

// Create a new user (admin can create any type)
const createUser = asyncHandler(async (req, res) => {
  const { full_name, email, phone_number, password_hash, user_type } = req.body || {};
  if (!isNonEmptyString(full_name, 120)) {
    return res.status(400).json({ error: 'full_name is required and must be <=120 chars.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  if (!isNonEmptyString(phone_number, 32)) {
    return res.status(400).json({ error: 'phone_number is required and must be <=32 chars.' });
  }
  if (!isNonEmptyString(password_hash, 200)) {
    return res.status(400).json({ error: 'password_hash is required.' });
  }
  if (!['owner', 'renter', 'both', 'admin'].includes(user_type)) {
    return res.status(400).json({ error: 'Invalid user_type.' });
  }
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, phone_number, password_hash, user_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, phone_number, user_type, created_at`,
    [full_name.trim(), email.trim().toLowerCase(), phone_number.trim(), password_hash, user_type]
  );
  res.status(201).json({ user: rows[0] });
});

// Update user details (admin only)
const updateUser = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid user id.' });
  }
  const { full_name, email, phone_number, user_type } = req.body || {};
  const fields = [];
  const values = [];
  if (full_name) {
    fields.push('full_name = $' + (values.length + 1));
    values.push(full_name.trim());
  }
  if (email) {
    fields.push('email = $' + (values.length + 1));
    values.push(email.trim().toLowerCase());
  }
  if (phone_number) {
    fields.push('phone_number = $' + (values.length + 1));
    values.push(phone_number.trim());
  }
  if (user_type) {
    fields.push('user_type = $' + (values.length + 1));
    values.push(user_type);
  }
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No updatable fields provided.' });
  }
  values.push(userId);
  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING id, full_name, email, phone_number, user_type, created_at`,
    values
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.status(200).json({ user: rows[0] });
});

// Delete a user (admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid user id.' });
  }
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.status(200).json({ message: 'User deleted.' });
});

module.exports = { listUsers, createUser, updateUser, deleteUser };
