const { pool } = require("../db/pool");
const {
  EQUIPMENT_CATEGORIES,
  isNonEmptyString,
  isValidHttpUrl,
  parsePositiveInteger,
} = require("../utils/validation");
const { asyncHandler } = require("../utils/async-handler");

const EQUIPMENT_FIELDS = {
  title: { column: "title", validate: (value) => isNonEmptyString(value, 160), required: true },
  category: {
    column: "category",
    validate: (value) => EQUIPMENT_CATEGORIES.has(value),
    required: true,
  },
  sub_category: {
    column: "sub_category",
    validate: (value) => isNonEmptyString(value, 100),
    required: true,
  },
  description: {
    column: "description",
    validate: (value) => typeof value === "string" && value.trim().length <= 5000,
    required: false,
  },
  price_per_day: {
    column: "price_per_day",
    validate: (value) => {
      const decimalValue = String(value);
      const price = typeof value === "number" ? value : Number(value);
      return (
        /^\d+(?:\.\d{1,2})?$/.test(decimalValue) &&
        Number.isFinite(price) &&
        price > 0 &&
        price <= 1_000_000_000
      );
    },
    required: true,
  },
  location: { column: "location", validate: (value) => isNonEmptyString(value, 200), required: true },
  image_url: {
    column: "image_url",
    validate: (value) => value === null || value === "" || isValidHttpUrl(value),
    required: false,
  },
  is_available: { column: "is_available", validate: (value) => typeof value === "boolean", required: false },
};

function validateEquipmentInput(body, partial) {
  const errors = [];

  for (const [field, definition] of Object.entries(EQUIPMENT_FIELDS)) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) {
      if (!partial && definition.required) {
        errors.push(`${field} is required.`);
      }
      continue;
    }

    if (!definition.validate(body[field])) {
      errors.push(`${field} is invalid.`);
    }
  }

  return errors;
}

const listEquipment = asyncHandler(async (req, res) => {
  const { category, location, search } = req.query;
  const limit = req.query.limit === undefined ? 20 : parsePositiveInteger(req.query.limit);
  const page = req.query.page === undefined ? 1 : parsePositiveInteger(req.query.page);

  if (limit === null || limit > 100 || page === null) {
    return res.status(400).json({ error: "limit must be 1-100 and page must be a positive integer." });
  }
  if (category !== undefined && !EQUIPMENT_CATEGORIES.has(category)) {
    return res.status(400).json({ error: "category must be Agriculture or Construction." });
  }
  if (location !== undefined && !isNonEmptyString(location, 200)) {
    return res.status(400).json({ error: "location must be a non-empty string of 200 characters or fewer." });
  }
  if (search !== undefined && !isNonEmptyString(search, 200)) {
    return res.status(400).json({ error: "search must be a non-empty string of 200 characters or fewer." });
  }

  const conditions = ["e.is_available = TRUE"];
  const values = [];

  if (category !== undefined) {
    values.push(category);
    conditions.push(`e.category = $${values.length}`);
  }
  if (location !== undefined) {
    values.push(`%${location.trim()}%`);
    conditions.push(`e.location ILIKE $${values.length}`);
  }
  if (search !== undefined) {
    const escapedSearch = search.trim().replace(/[\\%_]/g, "\\$&");
    values.push(`%${escapedSearch}%`);
    conditions.push(
      `(e.title ILIKE $${values.length} ESCAPE '\\' OR
        e.sub_category ILIKE $${values.length} ESCAPE '\\' OR
        e.description ILIKE $${values.length} ESCAPE '\\')`
    );
  }

  const offset = (page - 1) * limit;
  values.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT e.id, e.owner_id, e.title, e.category, e.sub_category, e.description,
            e.price_per_day, e.location, e.image_url, e.is_available, e.created_at,
             u.full_name AS owner_name
     FROM equipment e
     JOIN users u ON u.id = e.owner_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY e.created_at DESC, e.id
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return res.status(200).json({ equipment: rows, page, limit });
});

const getEquipmentById = asyncHandler(async (req, res) => {
  const id = parsePositiveInteger(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Equipment id must be a positive integer." });
  }

  const { rows } = await pool.query(
    `SELECT e.id, e.owner_id, e.title, e.category, e.sub_category, e.description,
            e.price_per_day, e.location, e.image_url, e.is_available, e.created_at,
           u.full_name AS owner_name
     FROM equipment e
     JOIN users u ON u.id = e.owner_id
     WHERE e.id = $1`,
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Equipment listing not found." });
  }

  return res.status(200).json({ equipment: rows[0] });
});

const createEquipment = asyncHandler(async (req, res) => {
  if (req.user.userType !== "owner" && req.user.userType !== "both") {
    return res.status(403).json({ error: "Only owners can create equipment listings." });
  }

  const body = req.body || {};
  const errors = validateEquipmentInput(body, false);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Invalid equipment listing.", details: errors });
  }

  const { rows } = await pool.query(
    `INSERT INTO equipment
       (owner_id, title, category, sub_category, description, price_per_day,
        location, image_url, is_available)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, owner_id, title, category, sub_category, description,
               price_per_day, location, image_url, is_available, created_at`,
    [
      req.user.id,
      body.title.trim(),
      body.category,
      body.sub_category.trim(),
      body.description === undefined ? null : body.description.trim(),
      body.price_per_day,
      body.location.trim(),
      body.image_url ? body.image_url.trim() : null,
      body.is_available === undefined ? true : body.is_available,
    ]
  );

  return res.status(201).json({ equipment: rows[0] });
});

const updateEquipment = asyncHandler(async (req, res) => {
  const id = parsePositiveInteger(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Equipment id must be a positive integer." });
  }

  const body = req.body || {};
  const fields = Object.keys(EQUIPMENT_FIELDS).filter((field) =>
    Object.prototype.hasOwnProperty.call(body, field)
  );
  if (fields.length === 0) {
    return res.status(400).json({ error: "Provide at least one supported field to update." });
  }

  const errors = validateEquipmentInput(body, true);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Invalid equipment listing.", details: errors });
  }

  const values = fields.map((field) => {
    const value = body[field];
    if (typeof value === "string") {
      return value.trim();
    }
    return value;
  });
  values.push(id, req.user.id);

  const assignments = fields.map((field, index) => `${EQUIPMENT_FIELDS[field].column} = $${index + 1}`);
  const { rows } = await pool.query(
    `UPDATE equipment
     SET ${assignments.join(", ")}
     WHERE id = $${values.length - 1} AND owner_id = $${values.length}
     RETURNING id, owner_id, title, category, sub_category, description,
               price_per_day, location, image_url, is_available, created_at`,
    values
  );

  if (rows.length === 0) {
    const existing = await pool.query("SELECT 1 FROM equipment WHERE id = $1", [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: "Equipment listing not found." });
    }
    return res.status(403).json({ error: "You can only update your own equipment listings." });
  }

  return res.status(200).json({ equipment: rows[0] });
});

module.exports = { listEquipment, getEquipmentById, createEquipment, updateEquipment };
