const dotenv = require("dotenv")
dotenv.config({ path: ".env" })

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")
const { connectdb } = require("./Config/db")
const morgan = require("morgan")
const helmet = require("helmet")
const compression = require("compression")
const { initCronJobs } = require("./Services/cronService")
const AuthRouter = require("./routes/auth.routes")
const NewsRouter = require("./routes/news.routes")
const OTPRouter = require("./routes/otp.route")
const AdsRouter = require("./routes/advertisement.route")
const AutoNewsRouter = require("./routes/autoNewsRoute")
const FacebookRouter = require("./routes/facebook.routes")
const BreakingNewsRouter = require("./routes/breakingNewsRoute")
const LiveScoreRouter = require("./routes/liveScoreRoute")
const InternationalProgramRouter = require("./routes/internationalProgramRoute")
const VisualStoryRouter = require("./routes/visualStory.route")
const OneSignalRouter = require("./routes/onesignal.routes")
const LinkedInRouter = require("./routes/linkedin.routes")
const TwitterRouter = require("./routes/twitter.routes")
const SitemapRouter = require("./routes/sitemap.routes")


const app = express()

// Connect to Database
connectdb()

// Security & Performance Middlewares
app.use(helmet({
    contentSecurityPolicy: false, // Set to false if you have trouble with external scripts/images initially
}))
app.use(compression())

const allowedOrigins = [
    "https://www.primetimemedia.in",
    "https://primetimemedia.in",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.40.0.231:3000",
    "http://localhost:8086"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// No-cache for dynamic API responses
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
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
app.use("/api/international-programs", InternationalProgramRouter)

app.use("/api/breaking-news", BreakingNewsRouter)
app.use("/api/visual-stories", VisualStoryRouter)
app.use("/api", AutoNewsRouter)
app.use("/fb", FacebookRouter)
app.use("/linkedin", LinkedInRouter)
app.use("/twitter", TwitterRouter)
app.use("/onesignal", OneSignalRouter)
app.use("/", SitemapRouter)

const { syncMatchesWithDB } = require("./Services/cricketService")

app.listen(process.env.PORT, () => {
    // Initialize Cron Jobs
    initCronJobs();

    console.log(`Server is running at http://localhost:${process.env.PORT}`);

    /*
    // Initial full sync on startup
    syncMatchesWithDB(true);

    // Live Polling (Every 10 seconds)
    // Only fetches full scorecard for matches marked 'isLiveTracked'
    setInterval(() => {
        const { pollLiveScores } = require("./Services/cricketService");
        pollLiveScores();
    }, 10000);

    // Discovery Sync (Every 1 hour)
    // Discovers new upcoming matches
    setInterval(() => {
        syncMatchesWithDB(true);
    }, 60 * 60 * 1000);
    */
})

// Prevent server crash on unhandled errors
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
});
