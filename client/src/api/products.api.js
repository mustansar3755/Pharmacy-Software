import api from "./axios";

/**
 * Products API wrappers.
 * Axios interceptor already response.data return karta hai, is liye har
 * function seedha backend ki body resolve karta hai.
 * (Yahan hum response ki shape par koi assumption nahi laga rahe,
 *  body jaisi aati hai waisi hi return hoti hai.)
 */

/**
 * Empty values (undefined, null, "") query se hata deta hai.
 * Warna ?search=&stock=&expiry= jaisi faltu params backend ko chali jati hain.
 */
const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

/**
 * GET /products
 * @param {{
 *   search?: string,        // title / generic / manufacturer / barcode
 *   stock?: "in_stock"|"low_stock"|"out_of_stock",
 *   expiry?: "valid"|"expiring_soon"|"expired",
 *   category?: string,
 *   includeInactive?: boolean,
 *   page?: number,
 *   limit?: number          // max 100
 * }} params
 * @returns {Promise<{ products: object[], pagination: object }>}
 */
export const getProductsApi = (params) =>
  api.get("/products", { params: cleanParams(params) });

/** GET /products/barcode/:code (POS scanner ke liye) */
export const getProductByBarcodeApi = (code) =>
  api.get(`/products/barcode/${encodeURIComponent(code)}`);

/** GET /products/:id */
export const getProductByIdApi = (id) => api.get(`/products/${id}`);

/**
 * POST /products
 * body: title*, category*, genericName, manufacturer, rackLocation,
 *       barcode, reorderLevel, batch{ batchNumber*, expiryDate*,
 *       purchasePrice*, salePrice*, quantity* }
 */
export const createProductApi = (data) => api.post("/products", data);

/**
 * PUT /products/:id (sirf master info edit)
 * Deactivated product wapas on karne ke liye: updateProductApi(id, { isActive: true })
 */
export const updateProductApi = (id, data) => api.put(`/products/${id}`, data);

/** DELETE /products/:id (asli delete nahi, sirf deactivate) */
export const deactivateProductApi = (id) => api.delete(`/products/${id}`);

/* ------------------------------------------------------------------ */
/* Batches                                                             */
/* ------------------------------------------------------------------ */

/**
 * POST /products/:id/batches
 * body: batchNumber, expiryDate, purchasePrice, salePrice, quantity
 */
export const addBatchApi = (productId, data) =>
  api.post(`/products/${productId}/batches`, data);

/**
 * PUT /products/:id/batches/:batchId
 * body: expiryDate, purchasePrice, salePrice, quantity
 * (batchNumber edit nahi hota, isko body me mat bhejna)
 */
export const updateBatchApi = (productId, batchId, data) =>
  api.put(`/products/${productId}/batches/${batchId}`, data);