const express = require("express");
const router = express.Router();
const { getVisualStories, createVisualStory, updateVisualStory, deleteVisualStory, getStoryById, getStoryBySlug } = require("../Controllers/visualStory.controller");

router.get("/", getVisualStories);
router.get("/slug/:slug", getStoryBySlug);
router.get("/:id", getStoryById);
router.post("/", createVisualStory);
router.put("/:id", updateVisualStory);
router.delete("/:id", deleteVisualStory);

module.exports = router;
