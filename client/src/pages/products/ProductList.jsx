import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Ban,
  RotateCcw,
  Pill,
  X,
} from "lucide-react";

import { getProductsApi, updateProductApi, deactivateProductApi } from "../../api/products.api";
import { useAuth } from "../../context/AuthContext";
import useDebounce from "../../hooks/useDebounce";
import { formatCurrency, formatDate, formatNumber } from "../../utils/format";
import {
  CATEGORY_SUGGESTIONS,
  STOCK_FILTER_OPTIONS,
  EXPIRY_FILTER_OPTIONS,
  DEFAULT_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
} from "../../utils/constants";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge, { StockBadge, ExpiryBadge } from "../../components/ui/Badge";
import { TableWrapper, Table, THead, TBody, Tr, Th, Td } from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";

/* Category dropdown: "All" + constants.js ki list (Title Case, backend exact match karta hai) */
const CATEGORY_FILTER_OPTIONS = [
  { value: "", label: "All Categories" },
  ...CATEGORY_SUGGESTIONS.map((c) => ({ value: c, label: c })),
];

/**
 * Request ki unique key: params + refreshTick.
 * Isse hum "loading" ko state me store karne ke bajaye DERIVE karte hain
 * (result.key !== current key => abhi data aa raha hai).
 */
const makeKey = (params, tick) => `${JSON.stringify(params)}#${tick}`;

/**
 * "Agla bikne wala batch" (FEFO): quantity > 0 aur expired nahi, jo sab se
 * jaldi expire ho. List me iski expiry date aur sale price dikhate hain.
 * Ye sirf DISPLAY ke liye hai; asli FIFO/FEFO deduction server karega.
 */
function getNextBatchInfo(batches = []) {
  const sellable = batches
    .filter((b) => b.quantity > 0 && b.expiryStatus !== "expired")
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  if (sellable.length === 0) return null;

  return {
    expiryDate: sellable[0].expiryDate,
    salePrice: sellable[0].salePrice,
    // Agar kai batches ki price alag hai to chhota sa hint dikhayenge
    multiplePrices: new Set(sellable.map((b) => b.salePrice)).size > 1,
  };
}

export default function ProductList() {
  const navigate = useNavigate();
  const { store } = useAuth();
  const currency = store?.currency || "Rs.";

  /* ---------- Filters ---------- */
  const [search, setSearch] = useState("");
  const [stock, setStock] = useState("");
  const [expiry, setExpiry] = useState("");
  const [category, setCategory] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  /**
   * Filter badalne par page 1 par wapas jana.
   * Ye render ke DAURAN hota hai (useEffect me nahi), jaise SidebarContext me
   * kiya tha: React isi render ko naye state ke saath dobara chalata hai,
   * is liye extra request ya lint warning nahi aati.
   */
  const filterKey = `${debouncedSearch}|${stock}|${expiry}|${category}|${includeInactive}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const hasFilters = !!(search || stock || expiry || category || includeInactive);

  const clearFilters = () => {
    setSearch("");
    setStock("");
    setExpiry("");
    setCategory("");
    setIncludeInactive(false);
  };

  /* ---------- Data fetching ---------- */
  const [refreshTick, setRefreshTick] = useState(0); // badalne par list dobara fetch hoti hai
  const [result, setResult] = useState({
    key: null,
    products: [],
    pagination: null,
    error: false,
  });

  // cleanParams (products.api.js) khali values khud hata deta hai
  const params = useMemo(
    () => ({
      search: debouncedSearch.trim(),
      stock,
      expiry,
      category,
      includeInactive: includeInactive || undefined,
      page,
      limit: DEFAULT_PAGE_SIZE,
    }),
    [debouncedSearch, stock, expiry, category, includeInactive, page]
  );

  const requestKey = makeKey(params, refreshTick);
  const loading = result.key !== requestKey;

  useEffect(() => {
    // "ignore": purani (late aane wali) request naye result ko overwrite na kare
    let ignore = false;
    const key = makeKey(params, refreshTick);

    getProductsApi(params)
      .then((data) => {
        if (ignore) return;
        setResult({
          key,
          products: data.products ?? [],
          pagination: data.pagination ?? null,
          error: false,
        });
      })
      .catch(() => {
        // Error toast axios interceptor dikha chuka hai
        if (ignore) return;
        setResult({ key, products: [], pagination: null, error: true });
      });

    return () => {
      ignore = true;
    };
  }, [params, refreshTick]);

  const refresh = () => setRefreshTick((t) => t + 1);

  /* ---------- Deactivate / Reactivate ---------- */
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  const [reactivatingId, setReactivatingId] = useState(null);

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await deactivateProductApi(deactivateTarget._id);
      toast.success(`${deactivateTarget.title} deactivated`);
      setDeactivateTarget(null);
      // Page ka akhri item hat gaya to ek page peeche jao (warna khali page dikhega)
      if (result.products.length === 1 && page > 1 && !includeInactive) {
        setPage(page - 1);
      }
      refresh();
    } catch {
      // Error toast interceptor ne dikha diya
    } finally {
      setDeactivating(false);
    }
  };

  const handleReactivate = async (product) => {
    setReactivatingId(product._id);
    try {
      await updateProductApi(product._id, { isActive: true });
      toast.success(`${product.title} reactivated`);
      refresh();
    } catch {
      // Error toast interceptor ne dikha diya
    } finally {
      setReactivatingId(null);
    }
  };

  /* ---------- Empty state (table ke andar) ---------- */
  const emptyContent = result.error ? (
    <EmptyState
      icon={Pill}
      title="Could not load products"
      description="Please check your connection and try again."
      action={<Button onClick={refresh}>Retry</Button>}
    />
  ) : hasFilters ? (
    <EmptyState
      icon={Search}
      title="No products match your filters"
      description="Try a different search or clear the filters."
      action={
        <Button variant="secondary" onClick={clearFilters}>
          Clear Filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={Pill}
      title="No products yet"
      description="Add your first product to start managing your inventory."
      action={
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate("/products/new")}>
          Add Product
        </Button>
      }
    />
  );

  /* ---------- UI ---------- */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Products</h2>
          <p className="text-sm text-slate-500">
            Manage your medicines, batches and stock levels.
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => navigate("/products/new")}>
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            className="sm:col-span-2 lg:col-span-1"
            placeholder="Search name, generic, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={18} />}
            aria-label="Search products"
          />
          <Select
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            options={STOCK_FILTER_OPTIONS}
            aria-label="Filter by stock"
          />
          <Select
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            options={EXPIRY_FILTER_OPTIONS}
            aria-label="Filter by expiry"
          />
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORY_FILTER_OPTIONS}
            aria-label="Filter by category"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-teal-600"
            />
            Show inactive products
          </label>

          {hasFilters && (
            <Button variant="ghost" size="sm" leftIcon={<X size={14} />} onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div>
        <TableWrapper>
          <Table>
            <THead>
              <Tr>
                <Th>Product</Th>
                <Th>Category</Th>
                <Th>Rack</Th>
                <Th align="right">Qty</Th>
                <Th align="right">Sale Price</Th>
                <Th>Next Expiry</Th>
                <Th>Stock</Th>
                <Th>Expiry</Th>
                <Th align="right">Actions</Th>
              </Tr>
            </THead>

            <TBody
              loading={loading}
              isEmpty={!loading && result.products.length === 0}
              colSpan={9}
              emptyContent={emptyContent}
            >
              {result.products.map((product) => {
                const next = getNextBatchInfo(product.batches);
                const inactive = product.isActive === false;

                return (
                  <Tr
                    key={product._id}
                    onClick={() => navigate(`/products/${product._id}`)}
                    className={inactive ? "opacity-60" : ""}
                  >
                    {/* Product: title + generic name + barcode */}
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{product.title}</span>
                        {inactive && (
                          <Badge color="slate" dot={false}>
                            Inactive
                          </Badge>
                        )}
                      </div>
                      {product.genericName && (
                        <p className="text-xs text-slate-500">{product.genericName}</p>
                      )}
                      {product.barcode && (
                        <p className="text-xs text-slate-400">{product.barcode}</p>
                      )}
                    </Td>

                    <Td>{product.category}</Td>
                    <Td>{product.rackLocation || "-"}</Td>

                    <Td align="right" className="font-medium">
                      {formatNumber(product.totalQuantity)}
                    </Td>

                    <Td align="right" className="whitespace-nowrap">
                      {next ? (
                        <>
                          {formatCurrency(next.salePrice, currency)}
                          {next.multiplePrices && (
                            <p className="text-xs text-amber-600">Price varies by batch</p>
                          )}
                        </>
                      ) : (
                        "-"
                      )}
                    </Td>

                    <Td className="whitespace-nowrap">
                      {next ? formatDate(next.expiryDate) : "-"}
                    </Td>

                    {/* Badges backend ke stockStatus / expiryStatus se bante hain */}
                    <Td>
                      <StockBadge status={product.stockStatus} />
                    </Td>
                    <Td>
                      <ExpiryBadge status={product.expiryStatus} />
                    </Td>

                    {/* Actions: stopPropagation, warna row click (detail page) bhi chal jata */}
                    <Td align="right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          to={`/products/${product._id}`}
                          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-teal-600"
                          title="View details"
                          aria-label={`View ${product.title}`}
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/products/${product._id}/edit`}
                          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-teal-600"
                          title="Edit"
                          aria-label={`Edit ${product.title}`}
                        >
                          <Pencil size={18} />
                        </Link>

                        {inactive ? (
                          <button
                            type="button"
                            onClick={() => handleReactivate(product)}
                            disabled={reactivatingId === product._id}
                            className="rounded-md p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                            title="Reactivate"
                            aria-label={`Reactivate ${product.title}`}
                          >
                            <RotateCcw size={18} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeactivateTarget(product)}
                            className="rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            title="Deactivate"
                            aria-label={`Deactivate ${product.title}`}
                          >
                            <Ban size={18} />
                          </button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </TBody>
          </Table>
        </TableWrapper>

        {!loading && <Pagination pagination={result.pagination} onPageChange={setPage} />}
      </div>

      {/* Deactivate confirmation */}
      <ConfirmDialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        loading={deactivating}
        title="Deactivate product?"
        message={`"${deactivateTarget?.title ?? ""}" will be hidden from the product list and POS. You can reactivate it later from "Show inactive products".`}
        confirmText="Deactivate"
      />
    </div>
  );
}