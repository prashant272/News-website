const { default: mongoose } = require("mongoose");

const connectdbWithRetry = async () => {
    const MONGO_URL = process.env.MONGO_URL;
    
    if (!MONGO_URL) {
        console.error("FATAL ERROR: MONGO_URL not defined in environment variables.");
        process.exit(1);
    }

    const options = {
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    };

    console.log("Attempting to connect to MongoDB...");
    
    try {
        await mongoose.connect(MONGO_URL, options);
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        console.log("Retrying in 5 seconds...");
        setTimeout(connectdbWithRetry, 5000);
    }
};

exports.connectdb = connectdbWithRetry;