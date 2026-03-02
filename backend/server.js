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
const BreakingNewsRouter = require("./routes/breakingNewsRoute")
const LiveScoreRouter = require("./routes/liveScoreRoute")


const app = express()

connectdb()

const allowedOrigins = [
    "https://www.primetimemedia.in",
    "https://primetimemedia.in",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.40.0.231:3000",
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

// Consolidated API routes
app.use("/api/live", LiveScoreRouter)

app.use("/api/breaking-news", BreakingNewsRouter)
app.use("/api", AutoNewsRouter)
app.use("/fb", FacebookRouter)

const { syncMatchesWithDB } = require("./Services/cricketService")

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);

    // Initial full sync on startup
    syncMatchesWithDB(true);

    // Live Polling (Every 10 seconds)
    // Only fetches full scorecard for matches marked 'isLiveTracked'
    setInterval(() => {
        const { pollLiveScores } = require("./Services/cricketService");
        pollLiveScores();
    }, 10000);

    // Daily Discovery Sync (Every 24 hours)
    // Discovers new upcoming matches
    setInterval(() => {
        syncMatchesWithDB(true);
    }, 24 * 60 * 60 * 1000);
})

// Prevent server crash on unhandled errors
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
});
