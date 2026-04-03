const express = require("express");
const router = express.Router();
const multer = require("multer");
const imageController = require("../Controllers/image.controller");

// Set up memory storage for multer (since we process in-memory with sharp)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @route POST /api/images/brand
 * @desc Upload an image and get back a version with the Prime Time logo at top-left.
 * @access Public/Admin (depends on server.js placement)
 */
router.post("/brand", upload.single("image"), imageController.brandImage);

module.exports = router;
