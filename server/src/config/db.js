// server/src/config/db.js
import mongoose from "mongoose";

/* ------------------------------------------------------------------
 * connectDB()
 * Server start hone se pehle database se connect karta hai.
 * Agar connection fail ho jaye to server band kar deta hai, kyun ke
 * bina database ke pharmacy software ka koi faida nahi.
 * ------------------------------------------------------------------ */
const connectDB = async () => {
  try {
    // MONGO_URI .env file se aayega (hardcode kabhi nahi karte)
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // 1 = error ke saath exit
  }
};

export default connectDB;