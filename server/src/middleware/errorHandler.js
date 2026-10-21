// server/src/middleware/errorHandler.js

/* ------------------------------------------------------------------
 * Field ke naam ko insaani zubaan me badalta hai
 * (duplicate error me kaam aata hai)
 * ------------------------------------------------------------------ */
const FIELD_LABELS = {
  barcode: "Barcode",
  email: "Email",
  invoiceNumber: "Invoice number",
  batchNumber: "Batch number",
};

/* ------------------------------------------------------------------
 * notFound
 * Koi route match na ho to 404. Sab routes ke BAAD lagta hai.
 * ------------------------------------------------------------------ */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

/* ------------------------------------------------------------------
 * errorHandler
 * Har error yahan aa kar ek hi format me jata hai:
 * { success: false, message }
 * (4 parameters zaroori hain, tab Express isay error handler samajhta hai)
 * ------------------------------------------------------------------ */
export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // 1. Duplicate key (unique index toot gaya): code 11000
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {}).find((k) => k !== "store");
    const label = FIELD_LABELS[field] || field || "Value";
    message = `${label} already exists`;
  }

  // 2. Mongoose validation error (required field khali, price negative, etc.)
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // 3. Galat id format (e.g. /api/products/abc123)
  else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  // Server ki apni ghalti (500) console me poori dikhao, user ko generic message
  if (statusCode === 500) {
    console.error("❌", err);
    if (process.env.NODE_ENV === "production") {
      message = "Internal Server Error";
    }
  } else {
    console.warn(`⚠️  ${statusCode} ${message}`);
  }

  res.status(statusCode).json({ success: false, message });
};