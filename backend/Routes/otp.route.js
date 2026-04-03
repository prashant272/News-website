const express = require("express")
const { sendOTP, verifyOTP } = require("../Controllers/otp.controller")



const OTPRouter = express.Router()

OTPRouter.post("/sentOTP",sendOTP)
OTPRouter.post("/verifyOTP",verifyOTP)

module.exports = OTPRouter