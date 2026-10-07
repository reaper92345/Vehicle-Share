// Delete equipment (admin only)
const { asyncHandler } = require('../utils/async-handler');
const { parsePositiveInteger } = require('../utils/validation');
const { pool } = require('../db/pool');

const deleteEquipment = asyncHandler(async (req, res) => {
  const equipmentId = parsePositiveInteger(req.params.id);
  if (!equipmentId) {
    return res.status(400).json({ error: 'Invalid equipment id.' });
  }
  const result = await pool.query('DELETE FROM equipment WHERE id = $1 RETURNING id', [equipmentId]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Equipment not found.' });
  }
  res.status(200).json({ message: 'Equipment deleted.' });
});

module.exports = { deleteEquipment };
