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

// Manual CORS and Logging Middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log(`[API REQUEST] ${req.method} ${req.url} - Origin: ${origin}`);

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if (!origin) {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

    // Handle Pre-flight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

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
app.use("/promotions", AdsRouter)
app.use("/api", AutoNewsRouter)
app.use("/fb", FacebookRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})
