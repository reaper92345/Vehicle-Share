const bcrypt = require("bcryptjs");
const { pool } = require("../db/pool");
const { asyncHandler } = require("../utils/async-handler");
const { isNonEmptyString, isValidEmail } = require("../utils/validation");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BCRYPT_ROUNDS = 12;

function parseUserId(value) {
  if (typeof value !== "string" || !UUID_RE.test(value)) return null;
  return value;
}

const DIRECTORY_SELECT = `id, full_name, email, phone_number, user_type, created_at`;

const listDirectory = asyncHandler(async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const values = [];
  let where = "WHERE is_disabled = FALSE";
  if (search) {
    values.push(`%${search.replace(/[\\%_]/g, "\\$&")}%`);
    where += ` AND (full_name ILIKE $1 ESCAPE '\\' OR email ILIKE $1 ESCAPE '\\' OR phone_number ILIKE $1 ESCAPE '\\')`;
  }
  const { rows } = await pool.query(
    `SELECT ${DIRECTORY_SELECT}
     FROM users
     ${where}
     ORDER BY full_name ASC
     LIMIT 200`,
    values
  );
  res.status(200).json({ users: rows });
});

const listUsers = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ${DIRECTORY_SELECT}, is_disabled FROM users ORDER BY created_at DESC`
  );
  res.status(200).json({ users: rows });
});

const createUser = asyncHandler(async (req, res) => {
  const { full_name, email, phone_number, password, password_hash, user_type } = req.body || {};
  if (!isNonEmptyString(full_name, 120)) {
    return res.status(400).json({ error: "full_name is required and must be <=120 chars." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "A valid email is required." });
  }
  if (!isNonEmptyString(phone_number, 32)) {
    return res.status(400).json({ error: "phone_number is required and must be <=32 chars." });
  }
  const rawPassword = typeof password === "string" ? password : "";
  if (!rawPassword && !isNonEmptyString(password_hash, 200)) {
    return res.status(400).json({ error: "password is required." });
  }
  if (rawPassword && (rawPassword.length < 8 || Buffer.byteLength(rawPassword, "utf8") > 72)) {
    return res.status(400).json({ error: "password must be at least 8 characters." });
  }
  if (!["owner", "renter", "both", "admin"].includes(user_type)) {
    return res.status(400).json({ error: "Invalid user_type." });
  }
  const hash = rawPassword ? await bcrypt.hash(rawPassword, BCRYPT_ROUNDS) : password_hash;
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, phone_number, password_hash, user_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${DIRECTORY_SELECT}, is_disabled`,
      [full_name.trim(), email.trim().toLowerCase(), phone_number.trim(), hash, user_type]
    );
    res.status(201).json({ user: rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    throw error;
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const userId = parseUserId(req.params.id);
  if (!userId) {
    return res.status(400).json({ error: "Invalid user id." });
  }
  const { full_name, email, phone_number, user_type, is_disabled } = req.body || {};
  const fields = [];
  const values = [];
  if (full_name) {
    fields.push(`full_name = $${values.length + 1}`);
    values.push(full_name.trim());
  }
  if (email) {
    fields.push(`email = $${values.length + 1}`);
    values.push(email.trim().toLowerCase());
  }
  if (phone_number) {
    fields.push(`phone_number = $${values.length + 1}`);
    values.push(phone_number.trim());
  }
  if (user_type) {
    if (!["owner", "renter", "both", "admin"].includes(user_type)) {
      return res.status(400).json({ error: "Invalid user_type." });
    }
    fields.push(`user_type = $${values.length + 1}`);
    values.push(user_type);
  }
  if (typeof is_disabled === "boolean") {
    fields.push(`is_disabled = $${values.length + 1}`);
    values.push(is_disabled);
  }
  if (fields.length === 0) {
    return res.status(400).json({ error: "No updatable fields provided." });
  }
  values.push(userId);
  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${values.length}
     RETURNING ${DIRECTORY_SELECT}, is_disabled`,
    values
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "User not found." });
  }
  res.status(200).json({ user: rows[0] });
});

const deleteUser = asyncHandler(async (req, res) => {
  const userId = parseUserId(req.params.id);
  if (!userId) {
    return res.status(400).json({ error: "Invalid user id." });
  }
  const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [userId]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "User not found." });
  }
  res.status(200).json({ message: "User deleted." });
});

module.exports = { listDirectory, listUsers, createUser, updateUser, deleteUser };
