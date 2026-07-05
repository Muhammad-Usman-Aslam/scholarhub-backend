const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

// ENV
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// ROUTES (FIXED PATH HERE)
const blogRoutes = require("./router/blogRoutes");   // ✅ FIXED
const contactRoutes = require("./router/ContactRouter");
const subscriberRouter = require("./router/subscriberRouter");

// MIDDLEWARE
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// TEST ROUTE (VERY IMPORTANT FOR DEBUGGING)
app.get("/api/test", (req, res) => {
  res.send("API WORKING");
});

// COOKIE EXAMPLE
app.get("/api/set-cookie", (req, res) => {
  res.cookie("scholarhub_user", "logged-in", {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });

  res.json({ message: "Cookie set successfully" });
});

app.get("/api/get-cookie", (req, res) => {
  res.json({ cookie: req.cookies.scholarhub_user || null });
});

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


// ROUTES
app.use("/api", blogRoutes);
app.use("/api", contactRoutes);
app.use("/api", subscriberRouter);

module.exports = app;
