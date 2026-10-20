// server/src/models/Sale.js
import mongoose from "mongoose";

/* ------------------------------------------------------------------
 * BATCH ALLOCATION SUB-SCHEMA
 * FIFO ka exact record: ek item ki quantity kin batches se kati,
 * har batch se kitni kati, aur us waqt price kya thi.
 * ------------------------------------------------------------------ */
const batchAllocationSchema = new mongoose.Schema(
  {
    batchId: { type: mongoose.Schema.Types.ObjectId, required: true },
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }, // sale price (snapshot)
    purchasePrice: { type: Number, required: true, min: 0 }, // profit report ke liye
    lineTotal: { type: Number, default: 0 }, // quantity * unitPrice
  },
  { _id: false }
);

/* ------------------------------------------------------------------
 * SALE ITEM SUB-SCHEMA
 * Customer/cart ko ek hi line nazar aati hai, lekin andar
 * batchAllocations me batches ka alag hisaab hota hai.
 * ------------------------------------------------------------------ */
const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // Snapshot: baad me product ka naam badal jaye to purani invoice na badle
    title: { type: String, required: true },
    genericName: { type: String, default: "" },

    quantity: { type: Number, required: true, min: 1 },
    batchAllocations: {
      type: [batchAllocationSchema],
      validate: [(v) => v.length > 0, "At least one batch allocation is required"],
    },

    lineTotal: { type: Number, default: 0 }, // allocations ke lineTotal ka sum
  },
  { _id: false }
);

// Virtual: customer ko dikhane ke liye average price per unit
saleItemSchema.virtual("avgUnitPrice").get(function () {
  return this.quantity > 0 ? this.lineTotal / this.quantity : 0;
});

/* ------------------------------------------------------------------
 * SALE (INVOICE) SCHEMA
 * ------------------------------------------------------------------ */
const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      index: true,
    },
    items: {
      type: [saleItemSchema],
      validate: [(v) => v.length > 0, "Invoice must have at least one item"],
    },

    // ---- Totals ----
    subTotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 }, // flat amount (Rs.)
    grandTotal: { type: Number, default: 0, min: 0 },

    // ---- Payment ----
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online"],
      default: "cash",
    },
    amountReceived: { type: Number, default: 0, min: 0 },
    changeReturned: { type: Number, default: 0, min: 0 },

    // ---- Extra info ----
    customerName: { type: String, trim: true, default: "Walk-in Customer" },
    status: {
      type: String,
      enum: ["completed", "refunded", "cancelled"],
      default: "completed",
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ------------------------------------------------------------------
 * PRE-VALIDATE HOOK
 * Save se pehle sab totals server par dobara calculate hote hain.
 * Frontend ke bheje hue totals par bharosa nahi karte (security).
 * ------------------------------------------------------------------ */
saleSchema.pre("validate", function () {
  // 1. Invoice number: INV-YYYYMMDD-XXXXXX
  if (!this.invoiceNumber) {
    const d = new Date();
    const date =
      d.getFullYear().toString() +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0");
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.invoiceNumber = `INV-${date}-${rand}`;
  }

  // 2. Har item ka total batch allocations se nikalo
  let subTotal = 0;
  for (const item of this.items) {
    let itemTotal = 0;
    for (const alloc of item.batchAllocations) {
      alloc.lineTotal = alloc.quantity * alloc.unitPrice;
      itemTotal += alloc.lineTotal;
    }
    item.lineTotal = itemTotal;
    subTotal += itemTotal;
  }

  // 3. Invoice totals (discount subtotal se zyada nahi ho sakta)
  this.subTotal = subTotal;
  this.discount = Math.min(this.discount, subTotal);
  this.grandTotal = subTotal - this.discount;

  // 4. Change (sirf jab received >= total)
  this.changeReturned = Math.max(0, this.amountReceived - this.grandTotal);
});

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;