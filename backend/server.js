const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
const { connectdb } = require("./Config/db")
const morgan = require("morgan")
const AuthRouter = require("./routes/auth.routes")
const NewsRouter = require("./routes/news.routes")
const OTPRouter = require("./routes/otp.route")
const AdsRouter = require("./routes/advertisement.route")

const app = express()

dotenv.config({path:"./Config/config.env"})
connectdb()

app.use(cors())

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store")
  res.setHeader("Pragma", "no-cache")
  res.setHeader("Expires", "0")
  next()
})

app.use(bodyParser.json({
    limit:"30mb"
}))

app.use(morgan("dev"))

app.get("/",(req,res)=>{
    res.send("Hello")
})

app.use("/auth",AuthRouter)
app.use("/news",NewsRouter)
app.use("/otp",OTPRouter)
app.use("/ads",AdsRouter)

app.listen(process.env.PORT,()=>{
    console.log("server is running");
})
