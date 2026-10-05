const express = require("express");
const { createReview, getReviewsForUser } = require("../controllers/reviews.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", requireAuth, createReview);
router.get("/user/:userId", getReviewsForUser);

module.exports = router;
