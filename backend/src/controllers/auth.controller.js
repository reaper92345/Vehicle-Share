const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db/pool");
const { USER_TYPES, isNonEmptyString, isValidEmail } = require("../utils/validation");
const { asyncHandler } = require("../utils/async-handler");

const BCRYPT_ROUNDS = 12;

const register = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const { full_name, email, phone_number, password, user_type } = body;

  if (!isNonEmptyString(full_name, 120)) {
    return res.status(400).json({ error: "full_name is required and must be 120 characters or fewer." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "A valid email address is required." });
  }
  if (!isNonEmptyString(phone_number, 32)) {
    return res.status(400).json({ error: "phone_number is required and must be 32 characters or fewer." });
  }
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({ error: "password must be at least 8 characters and at most 72 UTF-8 bytes." });
  }
  if (!USER_TYPES.has(user_type)) {
    return res.status(400).json({ error: "user_type must be renter, owner, or both." });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, phone_number, password_hash, user_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, phone_number, user_type, created_at`,
      [full_name.trim(), normalizedEmail, phone_number.trim(), passwordHash, user_type]
    );

    return res.status(201).json({ user: rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    throw error;
  }
});

const login = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const { email, password } = body;

  if (!isValidEmail(email) || typeof password !== "string" || password.length === 0) {
    return res.status(400).json({ error: "A valid email and password are required." });
  }

  const { rows } = await pool.query(
    `SELECT id, full_name, email, phone_number, password_hash, user_type, created_at
     FROM users
     WHERE email = $1`,
    [email.trim().toLowerCase()]
  );
  const user = rows[0];
  const passwordMatches = user
    ? await bcrypt.compare(password, user.password_hash)
    : await bcrypt.compare(password, "$2a$12$C6UzMDM.H6dfI/f/IKcEe.6J4eZ3QfA3e3.u7b7hCq6nHj2Y8a3gK");

  if (!user || !passwordMatches) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = jwt.sign(
    { userType: user.user_type },
    process.env.JWT_SECRET,
    {
      subject: user.id,
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      algorithm: "HS256",
    }
  );

  const { password_hash: _passwordHash, ...publicUser } = user;
  return res.status(200).json({ token, user: publicUser });
});

module.exports = { register, login };
