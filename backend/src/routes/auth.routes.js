const express = require("express");
const { login, register, getMe } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", requireAuth, getMe);

module.exports = router;
