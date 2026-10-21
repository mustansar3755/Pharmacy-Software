// server/src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* ------------------------------------------------------------------
 * ROLES
 * SUPER_ADMIN : platform ka malik (aap). Stores register karta hai.
 *               Kisi store se juda nahi hota (store field khali).
 * ADMIN       : pharmacy ka owner (Store Admin). Sirf apni store ka data.
 *
 * Future (V2) me staff roles yahan add honge.
 * ------------------------------------------------------------------ */
export const ROLES = {
  SUPER_ADMIN: "super_admin",
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
      unique: true, // login email poore platform me unique (ek email = ek account)
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
      default: ROLES.ADMIN,
    },

    // ---- Multi-tenant: ye user kis pharmacy ka hai ----
    // SUPER_ADMIN ke liye khali rehta hai, baaki sab ke liye zaroori.
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      index: true,
      required: [
        function () {
          return this.role !== ROLES.SUPER_ADMIN;
        },
        "Store is required for this user",
      ],
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