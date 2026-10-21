// server/src/routes/productRoutes.js
import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductByBarcode,
  getProductById,
  updateProduct,
  deactivateProduct,
  addBatch,
  updateBatch,
} from "../controllers/productController.js";
import { protect, authorize, requireStore } from "../middleware/auth.js";
import { ROLES } from "../models/User.js";

const router = Router();

/* ------------------------------------------------------------------
 * Is file ke SAB routes par:
 *  1. protect      : login zaroori
 *  2. requireStore : sirf pharmacy accounts (Super Admin yahan nahi aa sakta)
 * router.use() ek hi baar likhne se neeche ke har route par lag jata hai.
 * ------------------------------------------------------------------ */
router.use(protect, requireStore);

// Jo roles inventory badal sakte hain. V2 me yahan ROLES.PHARMACIST add hoga.
const canEditInventory = authorize(ROLES.ADMIN);

/* ------------------------------------------------------------------
 * ROUTES
 * ORDER ZAROORI HAI: "/barcode/:code" ko "/:id" se PEHLE likhna hai,
 * warna Express "barcode" ko bhi ek id samajh leta.
 * ------------------------------------------------------------------ */

// Collection
router.get("/", getProducts);
router.post("/", canEditInventory, createProduct);

// Barcode scanner (POS)
router.get("/barcode/:code", getProductByBarcode);

// Single product
router.get("/:id", getProductById);
router.put("/:id", canEditInventory, updateProduct);
router.delete("/:id", canEditInventory, deactivateProduct);

// Batches (naya stock aya / batch ki galti theek karni)
router.post("/:id/batches", canEditInventory, addBatch);
router.put("/:id/batches/:batchId", canEditInventory, updateBatch);

export default router;