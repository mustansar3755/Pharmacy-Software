// server/src/controllers/supplierController.js
import Supplier from "../models/Supplier.js";

/* ------------------------------------------------------------------
 * HELPERS
 * ------------------------------------------------------------------ */
const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Body se sirf allowed fields uthao. "store" kabhi body se nahi lete.
const pick = (obj, keys) =>
  Object.fromEntries(
    keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]])
  );

// Search text me special characters regex ko na bigaren
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Supplier hamesha store ke saath dhoondte hain (multi-tenant ki hifazat)
const findStoreSupplier = async (id, storeId) => {
  const supplier = await Supplier.findOne({ _id: id, store: storeId });
  if (!supplier) throw createError("Supplier not found", 404);
  return supplier;
};

const SUPPLIER_FIELDS = [
  "name",
  "contactPerson",
  "phone",
  "email",
  "address",
  "notes",
];

/* ------------------------------------------------------------------
 * POST /api/suppliers
 * Naya supplier. Sirf name zaroori hai.
 * ------------------------------------------------------------------ */
export const createSupplier = async (req, res) => {
  const data = pick(req.body, SUPPLIER_FIELDS);
  const supplier = await Supplier.create({ ...data, store: req.storeId });
  res.status(201).json({ success: true, supplier });
};

/* ------------------------------------------------------------------
 * GET /api/suppliers
 * Query: search, includeInactive, page, limit
 *  - search : name / contact person / phone
 * ------------------------------------------------------------------ */
export const getSuppliers = async (req, res) => {
  const { search, includeInactive } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

  const filter = { store: req.storeId };
  if (includeInactive !== "true") filter.isActive = true;

  if (search?.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ name: rx }, { contactPerson: rx }, { phone: rx }];
  }

  const [suppliers, count] = await Promise.all([
    Supplier.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Supplier.countDocuments(filter),
  ]);

  res.json({
    success: true,
    suppliers,
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
};

/* ------------------------------------------------------------------
 * GET /api/suppliers/:id
 * ------------------------------------------------------------------ */
export const getSupplierById = async (req, res) => {
  const supplier = await findStoreSupplier(req.params.id, req.storeId);
  res.json({ success: true, supplier });
};

/* ------------------------------------------------------------------
 * PUT /api/suppliers/:id
 * Supplier ki info edit. isActive bhi yahin se on/off hota hai.
 * ------------------------------------------------------------------ */
export const updateSupplier = async (req, res) => {
  const supplier = await findStoreSupplier(req.params.id, req.storeId);

  supplier.set(pick(req.body, [...SUPPLIER_FIELDS, "isActive"]));
  await supplier.save();

  res.json({ success: true, supplier });
};

/* ------------------------------------------------------------------
 * DELETE /api/suppliers/:id
 * Asli delete nahi, deactivate. Purane purchase bills safe rehte hain.
 * ------------------------------------------------------------------ */
export const deactivateSupplier = async (req, res) => {
  const supplier = await findStoreSupplier(req.params.id, req.storeId);
  supplier.isActive = false;
  await supplier.save();

  res.json({ success: true, message: "Supplier deactivated" });
};