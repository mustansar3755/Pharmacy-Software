// server/src/models/Store.js
import mongoose from "mongoose";

/* ------------------------------------------------------------------
 * STORE SCHEMA
 * Har pharmacy (tenant) ka ek document. Product, Sale aur User
 * is ko "store" field se refer karenge.
 * ------------------------------------------------------------------ */
const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
    },
    ownerName: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    licenseNumber: {
      type: String, // drug sale license number (receipt par chhapta hai)
      trim: true,
      default: "",
    },

    // ---- Receipt settings (80mm thermal receipt me use honge) ----
    receiptHeader: { type: String, trim: true, default: "" },
    receiptFooter: {
      type: String,
      trim: true,
      default: "Thank you! Get well soon.",
    },
    currency: { type: String, default: "Rs." },

    // ---- Platform control ----
    // Super Admin is flag se kisi store ko band/chalu kar sakta hai
    // (e.g. subscription fee na dene par). Data delete nahi hota.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Store ke naam se search ke liye (Super Admin panel me kaam aayega)
storeSchema.index({ name: 1 });

const Store = mongoose.model("Store", storeSchema);

export default Store;