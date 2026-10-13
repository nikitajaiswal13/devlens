const express = require("express");
const { analyze } = require("../controllers/analysisController");
const protect = require("../middleware/auth");

const router = express.Router();

// POST /api/analysis/analyze - Protected route, requires valid JWT Bearer token
router.post("/analyze", protect, analyze);

module.exports = router;
