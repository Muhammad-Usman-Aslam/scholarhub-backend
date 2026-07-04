const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const PORT =process.env.PORT

const app = express();

// Routes
const blogRoutes = require("./router/blogRoutes");
const contactRoutes = require("./router/ContactRouter");
const subscriberRouter = require("./router/subscriberRouter");

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI?.trim();
let isConnected = false;

async function connectToMongoDB() {
    if (isConnected) return;

    if (!MONGO_URI) {
        throw new Error("Missing MONGO_URI environment variable");
    }

    try {
        await mongoose.connect(MONGO_URI);

        isConnected = true;
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        throw error;
    }
}

// Connect before every request (only first request connects)
app.use(async (req, res, next) => {
    try {
        if (!isConnected) {
            await connectToMongoDB();
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message,
        });
    }
});



// Routes
app.use("/api", blogRoutes);
app.use("/api", contactRoutes);
app.use("/api", subscriberRouter);



module.exports = app;



