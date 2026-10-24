// server/src/models/Supplier.js
import mongoose from "mongoose";

/* ------------------------------------------------------------------
 * SUPPLIER SCHEMA
 * Wo distributor/company jis se pharmacy maal kharidti hai.
 * Har store ke apne suppliers hote hain (multi-tenant).
 *
 * NOTE: Supplier aur Manufacturer alag cheezein hain.
 *  - Supplier     : jis se aap ne maal kharida (distributor)
 *  - Manufacturer : jis company ne dawai banayi (Product me jayega)
 * ------------------------------------------------------------------ */
const supplierSchema = new mongoose.Schema(
  {
    // ---- Multi-tenant: ye supplier kis pharmacy ka hai ----
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store is required"],
      index: true,
    },

    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
    },
    contactPerson: {
      type: String, // salesman ya manager ka naam
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      match: [/^$|^\S+@\S+\.\S+$/, "Please provide a valid email"], // khali bhi chalega
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String, // e.g. "Jumeraat ko visit karta hai"
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true, // delete ki jagah deactivate (purane purchase bills safe)
    },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------
 * INDEXES
 * Supplier ka naam har store ke andar unique hai, aur "Ali Traders"
 * aur "ali traders" ko ek hi maana jata hai (collation strength 2).
 * Do alag pharmacies ke suppliers ka naam same ho sakta hai.
 * ------------------------------------------------------------------ */
supplierSchema.index(
  { store: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;