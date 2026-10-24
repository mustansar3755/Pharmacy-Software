// server/src/controllers/productController.js
import Product, { NEAR_EXPIRY_DAYS } from "../models/Product.js";

/* ------------------------------------------------------------------
 * HELPERS
 * ------------------------------------------------------------------ */
const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Body se sirf allowed fields uthao. "store" kabhi body se nahi lete,
// warna koi dusri pharmacy ke naam par product bana sakta hai.
const pick = (obj, keys) =>
  Object.fromEntries(
    keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]])
  );

// Search text me special characters (. * + etc.) regex ko na bigaren
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Product hamesha store ke saath dhoondte hain (multi-tenant ki hifazat)
const findStoreProduct = async (id, storeId) => {
  const product = await Product.findOne({ _id: id, store: storeId });
  if (!product) throw createError("Product not found", 404);
  return product;
};

// Naya batch add karte waqt expired medicine reject
const assertNotExpired = (expiryDate) => {
  const date = new Date(expiryDate);
  if (Number.isNaN(date.getTime())) {
    throw createError("Invalid expiry date", 400);
  }
  if (date <= new Date()) {
    throw createError("Expired medicine cannot be added to stock", 400);
  }
};

const MASTER_FIELDS = [
  "title",
  "genericName",
  "manufacturer",
  "category",
  "rackLocation",
  "barcode",
  "reorderLevel",
];
const BATCH_FIELDS = [
  "batchNumber",
  "expiryDate",
  "purchasePrice",
  "salePrice",
  "quantity",
];

/* ------------------------------------------------------------------
 * POST /api/products
 * Naya product. Chahein to pehla batch bhi saath de sakte hain:
 * { title, category, ..., batch: { batchNumber, expiryDate, ... } }
 * ------------------------------------------------------------------ */
export const createProduct = async (req, res) => {
  const data = pick(req.body, MASTER_FIELDS);

  if (req.body.batch) {
    const batch = pick(req.body.batch, BATCH_FIELDS);
    assertNotExpired(batch.expiryDate);
    data.batches = [batch];
  }

  const product = await Product.create({ ...data, store: req.storeId });
  res.status(201).json({ success: true, product });
};

/* ------------------------------------------------------------------
 * GET /api/products
 * Query: search, stock, expiry, category, page, limit, includeInactive
 *  - search : title / generic name / barcode
 *  - stock  : in_stock | low_stock | out_of_stock
 *  - expiry : valid | expiring_soon | expired
 * ------------------------------------------------------------------ */
export const getProducts = async (req, res) => {
  const { search, stock, expiry, category, includeInactive } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

  const filter = { store: req.storeId };
  const and = [];

  if (includeInactive !== "true") filter.isActive = true;
  if (category) filter.category = category;

  if (search?.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), "i");
    and.push({ $or: [{ title: rx }, { genericName: rx },  { manufacturer: rx },{ barcode: search.trim() }] });
  }

  // Stock filter: virtual DB me nahi hota, isliye $expr se total nikalte hain
  const total = { $sum: "$batches.quantity" };
  if (stock === "out_of_stock") {
    and.push({ $expr: { $lte: [total, 0] } });
  } else if (stock === "low_stock") {
    and.push({
      $expr: { $and: [{ $gt: [total, 0] }, { $lte: [total, "$reorderLevel"] }] },
    });
  } else if (stock === "in_stock") {
    and.push({ $expr: { $gt: [total, "$reorderLevel"] } });
  }

  // Expiry filter (sirf un batches par jin me quantity hai)
  const now = new Date();
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() + NEAR_EXPIRY_DAYS);
  const expiredBatch = { quantity: { $gt: 0 }, expiryDate: { $lte: now } };
  const nearBatch = { quantity: { $gt: 0 }, expiryDate: { $gt: now, $lte: limitDate } };

  if (expiry === "expired") {
    and.push({ batches: { $elemMatch: expiredBatch } });
  } else if (expiry === "expiring_soon") {
    // Product level badge me "expired" ko priority hai, isliye wo nikal do
    and.push({ batches: { $elemMatch: nearBatch } });
    and.push({ batches: { $not: { $elemMatch: expiredBatch } } });
  } else if (expiry === "valid") {
    and.push({
      batches: {
        $not: { $elemMatch: { quantity: { $gt: 0 }, expiryDate: { $lte: limitDate } } },
      },
    });
  }

  if (and.length) filter.$and = and;

  const [products, count] = await Promise.all([
    Product.find(filter)
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
}

/* ------------------------------------------------------------------
 * GET /api/products/barcode/:code
 * POS par scanner ke liye: barcode se ek product
 * ------------------------------------------------------------------ */
export const getProductByBarcode = async (req, res) => {
  const product = await Product.findOne({
    store: req.storeId,
    barcode: req.params.code,
    isActive: true,
  });
  if (!product) throw createError("No product found for this barcode", 404);
  res.json({ success: true, product });
};

/* ------------------------------------------------------------------
 * GET /api/products/:id
 * ------------------------------------------------------------------ */
export const getProductById = async (req, res) => {
  const product = await findStoreProduct(req.params.id, req.storeId);
  res.json({ success: true, product });
};

/* ------------------------------------------------------------------
 * PUT /api/products/:id
 * Sirf master info badalta hai (batches alag routes se).
 * isActive bhi yahin se on/off hota hai.
 * ------------------------------------------------------------------ */
export const updateProduct = async (req, res) => {
  const product = await findStoreProduct(req.params.id, req.storeId);

  product.set(pick(req.body, [...MASTER_FIELDS, "isActive"]));
  await product.save();

  res.json({ success: true, product });
};

/* ------------------------------------------------------------------
 * DELETE /api/products/:id
 * Asli delete nahi, deactivate. Purani invoices ka record safe rehta hai.
 * ------------------------------------------------------------------ */
export const deactivateProduct = async (req, res) => {
  const product = await findStoreProduct(req.params.id, req.storeId);
  product.isActive = false;
  await product.save();

  res.json({ success: true, message: "Product deactivated" });
};

/* ------------------------------------------------------------------
 * POST /api/products/:id/batches
 * Naya stock aya: product me naya batch jorho
 * ------------------------------------------------------------------ */
export const addBatch = async (req, res) => {
  const product = await findStoreProduct(req.params.id, req.storeId);
  const batch = pick(req.body, BATCH_FIELDS);

  assertNotExpired(batch.expiryDate);

  const batchNumber = String(batch.batchNumber || "").trim().toUpperCase();
  if (product.batches.some((b) => b.batchNumber === batchNumber)) {
    throw createError(
      `Batch ${batchNumber} already exists. Edit that batch instead`,
      409
    );
  }

  product.batches.push(batch);
  await product.save();

  res.status(201).json({ success: true, product });
};

/* ------------------------------------------------------------------
 * PUT /api/products/:id/batches/:batchId
 * Batch ki galti theek karna (price, expiry, quantity)
 * ------------------------------------------------------------------ */
export const updateBatch = async (req, res) => {
  const product = await findStoreProduct(req.params.id, req.storeId);
  const batch = product.batches.id(req.params.batchId);
  if (!batch) throw createError("Batch not found", 404);

  const updates = pick(req.body, [
    "expiryDate",
    "purchasePrice",
    "salePrice",
    "quantity",
  ]);
  if (updates.expiryDate !== undefined) assertNotExpired(updates.expiryDate);

  batch.set(updates);
  await product.save();

  res.json({ success: true, product });
};