// server/src/server.js
import "dotenv/config"; // .env load karta hai (sab se pehle hona chahiye)
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

// TEMPORARY: models import kiye taake syntax errors abhi pakre jayen.
// Jab controllers banenge to ye lines hata denge.
import "./models/Product.js";
import "./models/Sale.js";
import "./models/User.js";

const app = express();
const PORT = process.env.PORT || 5000;

/* ------------------------------------------------------------------
 * GLOBAL MIDDLEWARE
 * ------------------------------------------------------------------ */
app.use(helmet()); // security headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // React (Vite)
    credentials: true, // cookies allow karne ke liye
  })
);
app.use(express.json({ limit: "1mb" })); // JSON body parse
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev")); // console me request logs
}

/* ------------------------------------------------------------------
 * HEALTH CHECK ROUTE
 * Browser me http://localhost:5000/api/health khol kar server test karein
 * ------------------------------------------------------------------ */
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Pharmacy POS API is running" });
});

// Yahan aage hum routes lagayenge:
// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/sales", saleRoutes);

/* ------------------------------------------------------------------
 * 404 HANDLER (koi route match na ho to)
 * ------------------------------------------------------------------ */
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

/* ------------------------------------------------------------------
 * GLOBAL ERROR HANDLER
 * Kisi bhi route me error aye to yahan aa kar ek hi format me jata hai.
 * (4 parameters hone zaroori hain, tab Express ise error handler samajhta hai)
 * ------------------------------------------------------------------ */
app.use((err, _req, res, _next) => {
  console.error("❌", err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ------------------------------------------------------------------
 * START SERVER
 * Pehle DB connect hota hai, phir server listen karta hai
 * ------------------------------------------------------------------ */
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();