const express = require('express')
const { AddNews, getAllNews, getNewsBySlug, updateNewsBySlug, deleteNewsBySlug, getSectionNews, setNewsFlags, GetAnalytics, streamNews, getEmployeeReport, searchNews } = require('../Controllers/news.controller')

const NewsRouter = express.Router()

NewsRouter.post("/addnews", AddNews)
NewsRouter.get("/getallnews", getAllNews)
NewsRouter.get("/search", searchNews)
NewsRouter.get("/getnewsbyslug/:section/:slug", getNewsBySlug);
NewsRouter.get("/getnewsbysection/:section", getSectionNews);
NewsRouter.put("/updatenews/:section/:slug", updateNewsBySlug);
NewsRouter.delete("/deletenews/:section/:slug", deleteNewsBySlug);
NewsRouter.patch('/flags/:section/:slug', setNewsFlags);
NewsRouter.get("/analytics", GetAnalytics);
NewsRouter.get("/stream", streamNews);
NewsRouter.get("/employee-report", getEmployeeReport);

module.exports = NewsRouter