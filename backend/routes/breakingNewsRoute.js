const express = require("express");
const router = express.Router();
const {
    getBreakingNews,
    addBreakingNews,
    updateBreakingNews,
    deleteBreakingNews
} = require("../Controllers/breakingNewsController");

router.get("/", getBreakingNews);
router.post("/", addBreakingNews);
router.put("/:id", updateBreakingNews);
router.delete("/:id", deleteBreakingNews);

module.exports = router;
