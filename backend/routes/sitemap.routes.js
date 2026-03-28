const express = require("express");
const router = express.Router();
const sitemapController = require("../Controllers/sitemap.controller");

router.get("/sitemap.xml", sitemapController.generateSitemap);
router.get("/sitemap-news.xml", sitemapController.generateNewsSitemap);

module.exports = router;
