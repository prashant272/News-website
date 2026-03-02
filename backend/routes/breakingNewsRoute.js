const express = require("express");
const router = express.Router();
const {
    getBreakingNews,
    addBreakingNews,
    updateBreakingNews,
    deleteBreakingNews,
    bulkAddBreakingNews,
    scrapeBreakingNews
} = require("../Controllers/breakingNewsController");

router.get("/", getBreakingNews);
router.post("/", addBreakingNews);
router.post("/bulk", bulkAddBreakingNews);
router.post("/scrape", scrapeBreakingNews);
router.put("/:id", updateBreakingNews);
router.delete("/:id", deleteBreakingNews);

module.exports = router;
