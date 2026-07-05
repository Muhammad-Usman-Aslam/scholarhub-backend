const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Routes
const blogRoutes = require("./router/blogRoutes");
const contactRoutes = require("./router/ContactRouter");
const subscriberRouter = require("./router/subscriberRouter");

// Test Route
app.get("/api/test", (req, res) => {
  res.send("API WORKING");
});

// Cookie Routes
app.get("/api/set-cookie", (req, res) => {
  res.cookie("scholarhub_user", "logged-in", {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });

  res.json({ message: "Cookie set successfully" });
});

app.get("/api/get-cookie", (req, res) => {
  res.json({
    cookie: req.cookies.scholarhub_user || null,
  });
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

// Connect to MongoDB before handling requests
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

// API Routes
app.use("/api", blogRoutes);
app.use("/api", contactRoutes);
app.use("/api", subscriberRouter);

module.exports = app;