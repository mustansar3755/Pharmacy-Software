// server/src/controllers/authController.js
import User, { ROLES } from "../models/User.js";
import Store from "../models/Store.js";
import {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} from "../utils/generateToken.js";

/* ------------------------------------------------------------------
 * Helper: statusCode wali error banata hai
 * ------------------------------------------------------------------ */
const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/* ------------------------------------------------------------------
 * POST /api/auth/login
 * Body: { email, password }
 * ------------------------------------------------------------------ */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError("Email and password are required", 400);
  }

  // password select: false hai, is liye "+password" se manga rahe hain
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password"
  );

  // Email ya password galat: dono ke liye ek hi message (attacker ko hint nahi milta)
  if (!user || !(await user.comparePassword(password))) {
    throw createError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw createError("This account is deactivated", 401);
  }

  // Store Admin ke liye: pharmacy active honi chahiye
  let store = null;
  if (user.role !== ROLES.SUPER_ADMIN) {
    store = await Store.findById(user.store);
    if (!store || !store.isActive) {
      throw createError("Your pharmacy account is deactivated. Contact support", 403);
    }
  }

  // Token banao aur cookie me rakho
  const token = generateToken(user);
  setTokenCookie(res, token);

  res.json({
    success: true,
    message: "Login successful",
    token, // Postman testing ke liye (frontend cookie use karega)
    user, // toJSON password hata deta hai
    store,
  });
};

/* ------------------------------------------------------------------
 * POST /api/auth/logout
 * ------------------------------------------------------------------ */
export const logout = async (_req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: "Logged out" });
};

/* ------------------------------------------------------------------
 * GET /api/auth/me   (protect ke baad)
 * Page refresh par frontend yahan se pooch kar login state wapas banata hai
 * ------------------------------------------------------------------ */
export const getMe = async (req, res) => {
  let store = null;
  if (req.storeId) {
    store = await Store.findById(req.storeId);
  }
  res.json({ success: true, user: req.user, store });
};