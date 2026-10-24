// server/src/routes/supplierRoutes.js
import { Router } from "express";
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deactivateSupplier,
} from "../controllers/supplierController.js";
import { protect, authorize, requireStore } from "../middleware/auth.js";
import { ROLES } from "../models/User.js";

const router = Router();

/* ------------------------------------------------------------------
 * Is file ke SAB routes par:
 *  1. protect      : login zaroori
 *  2. requireStore : sirf pharmacy accounts (Super Admin yahan nahi aa sakta)
 * ------------------------------------------------------------------ */
router.use(protect, requireStore);

// Jo roles suppliers badal sakte hain. V2 me yahan ROLES.PHARMACIST add hoga.
const canManageSuppliers = authorize(ROLES.ADMIN);

/* ------------------------------------------------------------------
 * ROUTES
 * ------------------------------------------------------------------ */

// Collection
router.get("/", getSuppliers);
router.post("/", canManageSuppliers, createSupplier);

// Single supplier
router.get("/:id", getSupplierById);
router.put("/:id", canManageSuppliers, updateSupplier);
router.delete("/:id", canManageSuppliers, deactivateSupplier);

export default router;