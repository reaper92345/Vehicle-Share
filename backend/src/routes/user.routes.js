const express = require("express");
const { listDirectory } = require("../controllers/user.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, listDirectory);

module.exports = router;
