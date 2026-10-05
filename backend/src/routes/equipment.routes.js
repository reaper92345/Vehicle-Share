const express = require("express");
const {
  createEquipment,
  getEquipmentById,
  listEquipment,
  updateEquipment,
} = require("../controllers/equipment.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", listEquipment);
router.get("/:id", getEquipmentById);
router.post("/", requireAuth, createEquipment);
router.put("/:id", requireAuth, updateEquipment);

module.exports = router;
