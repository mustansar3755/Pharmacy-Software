// server/src/utils/generateToken.js
import jwt from "jsonwebtoken";

/* ------------------------------------------------------------------
 * CONSTANTS
 * Token aur cookie ki expiry ek hi jagah se chalti hai, taake dono
 * hamesha barabar rahen.
 * ------------------------------------------------------------------ */
const TOKEN_DAYS = 7;
const COOKIE_NAME = "token";

/* ------------------------------------------------------------------
 * generateToken(user)
 * User ke liye signed JWT banata hai.
 * Payload me sirf zaroori cheezein: id, role, store.
 * Password ya koi hassas data kabhi token me nahi daalte, kyun ke
 * token ko koi bhi decode karke parh sakta hai (sirf badal nahi sakta).
 * ------------------------------------------------------------------ */
export const generateToken = (user) => {
  // .env se function ke andar parhte hain (file load hote waqt nahi)
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET .env me likhna zaroori hai");
  }

  const payload = {
    id: user._id,
    role: user.role,
    store: user.store || null, // Super Admin ka store khali hota hai
  };

  return jwt.sign(payload, secret, { expiresIn: `${TOKEN_DAYS}d` });
};

/* ------------------------------------------------------------------
 * setTokenCookie(res, token)
 * Token ko httpOnly cookie me bhejta hai.
 *  - httpOnly : browser ka JavaScript isay parh nahi sakta (XSS se bachao)
 *  - secure   : production me sirf HTTPS par bheji jayegi
 *  - sameSite : dusri website se request par cookie nahi jati (CSRF se bachao)
 * ------------------------------------------------------------------ */
export const setTokenCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_DAYS * 24 * 60 * 60 * 1000, // milliseconds
  });
};

/* ------------------------------------------------------------------
 * clearTokenCookie(res)
 * Logout ke waqt cookie hata deta hai.
 * ------------------------------------------------------------------ */
export const clearTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

export { COOKIE_NAME };