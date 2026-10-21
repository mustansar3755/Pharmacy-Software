// server/src/seed/createSuperAdmin.js
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User, { ROLES } from "../models/User.js";

/* ------------------------------------------------------------------
 * createSuperAdmin()
 * Platform ka malik (Super Admin) banata hai. Ye kisi store se juda
 * nahi hota, is liye `store` field nahi di jati.
 * Credentials .env se aate hain, code me hardcode nahi hote.
 * ------------------------------------------------------------------ */
const createSuperAdmin = async () => {
  let exitCode = 0;

  try {
    await connectDB();

    const name = process.env.SUPER_ADMIN_NAME || "Platform Owner";
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    // .env me values na hon to yahin ruk jao
    if (!email || !password) {
      throw new Error("SUPER_ADMIN_EMAIL aur SUPER_ADMIN_PASSWORD .env me likhna zaroori hai");
    }

    // Pehle check karo ye email pehle se to nahi hai
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log(`⚠️  User already exists: ${existing.email} (${existing.role})`);
    } else {
      // password ki hashing User model ka pre("save") hook khud karega
      const superAdmin = await User.create({
        name,
        email,
        password,
        role: ROLES.SUPER_ADMIN,
      });
      console.log(`✅ Super Admin created: ${superAdmin.email}`);
    }
  } catch (error) {
    console.error(`❌ Seed failed: ${error.message}`);
    exitCode = 1;
  } finally {
    await mongoose.connection.close();
    process.exit(exitCode);
  }
};

createSuperAdmin();