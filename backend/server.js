const dotenv = require("dotenv")
dotenv.config({ path: ".env" })

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")
const { connectdb } = require("./Config/db")
const morgan = require("morgan")
const AuthRouter = require("./routes/auth.routes")
const NewsRouter = require("./routes/news.routes")
const OTPRouter = require("./routes/otp.route")
const AdsRouter = require("./routes/advertisement.route")
const AutoNewsRouter = require("./routes/autoNewsRoute")
const FacebookRouter = require("./routes/facebook.routes")


const app = express()

connectdb()

const allowedOrigins = [
    "https://www.primetimemedia.in",
    "https://primetimemedia.in",
    "http://localhost:3000",
    "http://localhost:8086"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));


// Pre-flight requests are already handled by the global app.use(cors()) above

app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store")
    res.setHeader("Pragma", "no-cache")
    res.setHeader("Expires", "0")
    next()
})

app.use(bodyParser.json({
    limit: "30mb"
}))

app.use(morgan("dev"))

app.get("/", (req, res) => {
    res.send("Hello")
})

app.use("/auth", AuthRouter)
app.use("/news", NewsRouter)
app.use("/otp", OTPRouter)
app.use("/ads", AdsRouter)
app.use("/api", AutoNewsRouter)
app.use("/fb", FacebookRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})
