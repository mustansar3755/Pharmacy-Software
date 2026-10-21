// server/src/seed/createStore.js
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Store from "../models/Store.js";
import User, { ROLES } from "../models/User.js";

/* ------------------------------------------------------------------
 * createStore()
 * Ek pharmacy (Store) aur us ka owner (Store Admin) banata hai.
 * Sab values .env se aati hain, code me hardcode nahi hotin.
 *
 * NOTE: Ye sirf development/testing ke liye hai. Baad me Super Admin
 * panel se API ke zariye naye stores register honge.
 * ------------------------------------------------------------------ */
const createStore = async () => {
  let exitCode = 0;
  let createdStore = null; // fail hone par cleanup ke liye

  try {
    await connectDB();

    const storeName = process.env.STORE_NAME;
    const adminName = process.env.STORE_ADMIN_NAME || "Store Owner";
    const adminEmail = process.env.STORE_ADMIN_EMAIL;
    const adminPassword = process.env.STORE_ADMIN_PASSWORD;

    // .env me zaroori values na hon to yahin ruk jao
    if (!storeName || !adminEmail || !adminPassword) {
      throw new Error(
        "STORE_NAME, STORE_ADMIN_EMAIL aur STORE_ADMIN_PASSWORD .env me likhna zaroori hai"
      );
    }

    // Store banane se PEHLE email check karo, warna store ban jata
    // aur user fail hota (bina owner wala store reh jata)
    const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingUser) {
      throw new Error(`Ye email pehle se maujood hai: ${existingUser.email}`);
    }

    // 1. Store banao
    createdStore = await Store.create({
      name: storeName,
      ownerName: adminName,
      phone: process.env.STORE_PHONE || "",
      address: process.env.STORE_ADDRESS || "",
      licenseNumber: process.env.STORE_LICENSE || "",
    });
    console.log(`✅ Store created: ${createdStore.name} (id: ${createdStore._id})`);

    // 2. Store Admin banao, usi store se jodo
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // hashing pre("save") hook karega
      role: ROLES.ADMIN,
      store: createdStore._id,
    });
    console.log(`✅ Store Admin created: ${admin.email}`);
  } catch (error) {
    console.error(`❌ Seed failed: ${error.message}`);
    exitCode = 1;

    // Agar store ban gaya lekin admin fail hua, to store wapas hata do
    if (createdStore) {
      await Store.findByIdAndDelete(createdStore._id);
      console.log("🧹 Adhoora bana hua store hata diya gaya");
    }
  } finally {
    await mongoose.connection.close();
    process.exit(exitCode);
  }
};

createStore();