// server/src/models/Product.js
import mongoose from "mongoose";

/* ------------------------------------------------------------------
 * CONSTANTS
 * Itne din ke andar expire hone wali medicine "Expiring Soon" kehlayegi
 * ------------------------------------------------------------------ */
export const NEAR_EXPIRY_DAYS = 60;

/* ------------------------------------------------------------------
 * BATCH SUB-SCHEMA
 * Ek product ke multiple batches hote hain. Har batch ki apni expiry,
 * price, quantity aur ye record ke maal kis se, kis bill se aya.
 * ------------------------------------------------------------------ */
const batchSchema = new mongoose.Schema(
  {
    batchNumber: {
      type: String,
      required: [true, "Batch number is required"],
      trim: true,
      uppercase: true,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0, "Purchase price cannot be negative"],
    },
    salePrice: {
      type: Number,
      required: [true, "Sale price is required"],
      min: [0, "Sale price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    receivedAt: {
      type: Date,
      default: Date.now, // batch kab stock me aya (FIFO tie-breaker)
    },

    // ---- Traceability: ye batch kahan se aya (dono optional) ----
    // Opening stock ya bina bill ke maal me khali reh sakte hain.
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: har batch ka expiry status (valid / expiring_soon / expired)
batchSchema.virtual("expiryStatus").get(function () {
  const now = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + NEAR_EXPIRY_DAYS);

  if (this.expiryDate <= now) return "expired";
  if (this.expiryDate <= limit) return "expiring_soon";
  return "valid";
});

/* ------------------------------------------------------------------
 * PRODUCT SCHEMA (Master Info + Batches array)
 * ------------------------------------------------------------------ */
const productSchema = new mongoose.Schema(
  {
    // ---- Multi-tenant: ye product kis pharmacy ka hai ----
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store is required"],
      index: true,
    },

    // ---- Master Info ----
    title: {
      type: String,
      required: [true, "Medicine title is required"],
      trim: true,
    },
    genericName: {
      type: String, // Salt name, e.g. Paracetamol
      trim: true,
      default: "",
    },
    manufacturer: {
      type: String, // Dawai banane wali company, e.g. GSK (optional)
      trim: true,
      default: "",
    },
    category: {
      type: String, // Tablet, Syrup, Injection, etc.
      required: [true, "Category is required"],
      trim: true,
    },
    rackLocation: {
      type: String, // Rack / Shelf, e.g. "A-3"
      trim: true,
      default: "",
    },
    barcode: {
      type: String,
      trim: true,
      // unique yahan nahi, neeche compound index me (store ke andar unique)
    },
    reorderLevel: {
      type: Number,
      default: 10, // is se kam ya barabar total qty = "Low Stock"
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true, // delete ki jagah deactivate karein
    },

    // ---- Batches ----
    batches: [batchSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ------------------------------------------------------------------
 * INDEXES
 * ------------------------------------------------------------------ */

// Barcode har store ke andar unique (sirf jin ka barcode likha ho)
productSchema.index(
  { store: 1, barcode: 1 },
  {
    unique: true,
    partialFilterExpression: { barcode: { $type: "string", $gt: "" } },
  }
);

// Fast search: title aur generic name se
productSchema.index({ title: "text", genericName: "text" });

// Store ke andar naam se sorting/filter
productSchema.index({ store: 1, title: 1 });

/* ------------------------------------------------------------------
 * VIRTUALS (database me save nahi hote, runtime pe calculate hote hain)
 * ------------------------------------------------------------------ */

// Sab batches ki total quantity
productSchema.virtual("totalQuantity").get(function () {
  return this.batches.reduce((sum, b) => sum + b.quantity, 0);
});

// Stock level badge: in_stock / low_stock / out_of_stock
productSchema.virtual("stockStatus").get(function () {
  const total = this.totalQuantity;
  if (total <= 0) return "out_of_stock";
  if (total <= this.reorderLevel) return "low_stock";
  return "in_stock";
});

// Product level expiry badge: sirf un batches ko dekhta hai jin me stock hai
productSchema.virtual("expiryStatus").get(function () {
  const stocked = this.batches.filter((b) => b.quantity > 0);
  if (stocked.length === 0) return "valid"; // stock hi nahi to expiry ka masla nahi

  const statuses = stocked.map((b) => b.expiryStatus);
  if (statuses.includes("expired")) return "expired";
  if (statuses.includes("expiring_soon")) return "expiring_soon";
  return "valid";
});

/* ------------------------------------------------------------------
 * METHOD: getFifoBatches()
 * Billing ke liye sellable batches wapas deta hai, FIFO/FEFO order me:
 *  - expired batches aur zero-quantity batches nikal di jati hain
 *  - sab se jaldi expire hone wala batch sab se pehle
 *  - expiry barabar ho to jo pehle stock me aya wo pehle
 * ------------------------------------------------------------------ */
productSchema.methods.getFifoBatches = function () {
  const now = new Date();
  return this.batches
    .filter((b) => b.quantity > 0 && b.expiryDate > now)
    .sort((a, b) => {
      if (a.expiryDate - b.expiryDate !== 0) return a.expiryDate - b.expiryDate;
      return a.receivedAt - b.receivedAt;
    });
};

const Product = mongoose.model("Product", productSchema);

export default Product;