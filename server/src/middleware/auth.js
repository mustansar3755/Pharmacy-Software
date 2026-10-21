// server/src/middleware/auth.js
import jwt from "jsonwebtoken";
import User, { ROLES } from "../models/User.js";
import Store from "../models/Store.js";
import { COOKIE_NAME } from "../utils/generateToken.js";

/* ------------------------------------------------------------------
 * Helper: statusCode wali error banata hai.
 * server.js ka global error handler isi statusCode ko use karta hai.
 * ------------------------------------------------------------------ */
const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/* ------------------------------------------------------------------
 * protect
 * Har protected route se pehle chalta hai:
 *  1. Token nikalta hai (cookie se, warna Authorization header se)
 *  2. Token verify karta hai
 *  3. Database se user aur uski store dobara check karta hai
 *  4. req.user aur req.storeId set karta hai
 * ------------------------------------------------------------------ */
export const protect = async (req, _res, next) => {
  // 1. Token dhoondo. Cookie pehle (browser), header baad me (Postman testing)
  let token = req.cookies?.[COOKIE_NAME];
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    throw createError("Please login to continue", 401);
  }

  // 2. Verify (expired ya jaali token par error aayega)
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createError("Session expired or invalid. Please login again", 401);
  }

  // 3. User database se lo (token par akele bharosa nahi)
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw createError("This account is no longer active", 401);
  }

  // 4. Store admin ke liye: uski pharmacy active honi chahiye
  if (user.role !== ROLES.SUPER_ADMIN) {
    const store = await Store.findById(user.store).select("isActive");
    if (!store || !store.isActive) {
      throw createError("Your pharmacy account is deactivated. Contact support", 403);
    }
  }

  // 5. Aage ke controllers ke liye set karo
  req.user = user;
  req.storeId = user.store || null; // har query me yehi se filter lagega
  next();
};

/* ------------------------------------------------------------------
 * authorize(...roles)
 * Role check. protect ke BAAD lagta hai.
 * Misal: router.post("/stores", protect, authorize(ROLES.SUPER_ADMIN), ...)
 * ------------------------------------------------------------------ */
export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw createError("You do not have permission to do this", 403);
    }
    next();
  };
};

/* ------------------------------------------------------------------
 * requireStore
 * Product, Sale jese store ke data wale routes par lagta hai.
 * Super Admin ka koi store nahi hota, is liye wo in routes par
 * nahi ja sakta (warna store=null se ajeeb queries chalti).
 * ------------------------------------------------------------------ */
export const requireStore = (req, _res, next) => {
  if (!req.storeId) {
    throw createError("This action is only for pharmacy accounts", 403);
  }
  next();
};