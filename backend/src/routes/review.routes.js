const express = require("express");
const { createReview, getReviewsForUser, getEquipmentReviews } = require("../controllers/reviews.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", requireAuth, createReview);
router.get("/user/:userId", getReviewsForUser);
router.get("/equipment/:equipmentId", getEquipmentReviews);

module.exports = router;
