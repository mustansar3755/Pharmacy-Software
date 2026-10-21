// server/src/routes/authRoutes.js
import { Router } from "express";
import { login, logout, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Public: login ke liye token ki zaroorat nahi
router.post("/login", login);
router.post("/logout", logout);

// Protected: pehle protect chalega, phir getMe
router.get("/me", protect, getMe);

export default router;