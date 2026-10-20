// server/src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* ------------------------------------------------------------------
 * ROLES
 * V1 me sirf ADMIN hai (owner akela sab kuch sambhalta hai).
 * Future me staff rakhna ho to neeche wali commented lines khol dein
 * aur ROLES me add kar dein. Baaki code change nahi hoga.
 * ------------------------------------------------------------------ */
export const ROLES = {
  ADMIN: "admin",
  // PHARMACIST: "pharmacist", // V2
  // CASHIER: "cashier",       // V2
};

/* ------------------------------------------------------------------
 * USER SCHEMA
 * ------------------------------------------------------------------ */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // queries me password default se nahi aayega
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.ADMIN, // V1: har user admin hai
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------
 * PRE-SAVE HOOK: password hash
 * Sirf tab hash hota hai jab password naya ya change hua ho
 * ------------------------------------------------------------------ */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

/* ------------------------------------------------------------------
 * METHOD: comparePassword
 * Login ke waqt entered password ko hashed password se match karta hai
 * ------------------------------------------------------------------ */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/* ------------------------------------------------------------------
 * toJSON: response se password hamesha hata do (extra safety)
 * ------------------------------------------------------------------ */
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;