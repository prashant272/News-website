const express = require('express');
const { AddAd, UpdateAd, DeleteAd, GetAllAds, GetActiveAds } = require("../Controllers/advertisement.controller");

const AdsRouter = express.Router();

AdsRouter.post("/add", AddAd);
AdsRouter.get("/all", GetAllAds);
AdsRouter.get("/active", GetActiveAds);
AdsRouter.put("/update/:id", UpdateAd);
AdsRouter.delete("/delete/:id", DeleteAd);  

module.exports = AdsRouter;
