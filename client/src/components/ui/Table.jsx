import Spinner from "./Spinner";

/**
 * Table: small set of styled building blocks for data tables.
 * We keep plain HTML table semantics (thead, tbody, tr, th, td) and only add
 * Tailwind styling, so pages keep full control over their columns and cells.
 *
 * Usage:
 *   <TableWrapper>
 *     <Table>
 *       <THead>
 *         <Tr>
 *           <Th>Title</Th>
 *           <Th align="right">Qty</Th>
 *         </Tr>
 *       </THead>
 *       <TBody loading={loading} colSpan={2} isEmpty={!items.length}
 *              emptyContent={<EmptyState ... />}>
 *         {items.map((p) => (
 *           <Tr key={p._id} onClick={() => open(p)}>
 *             <Td>{p.title}</Td>
 *             <Td align="right">{p.totalQuantity}</Td>
 *           </Tr>
 *         ))}
 *       </TBody>
 *     </Table>
 *   </TableWrapper>
 */

/* Card with border + horizontal scroll (wide tables scroll inside this box,
   not the whole page) */
export function TableWrapper({ children, className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Table({ children, className = "" }) {
  return (
    <table className={`w-full min-w-full text-left text-sm ${className}`}>
      {children}
    </table>
  );
}

export function THead({ children }) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50">{children}</thead>
  );
}

/**
 * TBody: handles the three states of a table body in one place:
 *  1. loading  -> spinner row
 *  2. isEmpty  -> emptyContent row (e.g. <EmptyState />)
 *  3. otherwise -> the real rows (children)
 * colSpan must equal the number of columns so the message spans the full width.
 */
export function TBody({
  children,
  loading = false,
  isEmpty = false,
  colSpan = 1,
  emptyContent = null,
}) {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan} className="py-16 text-center">
            <div className="flex justify-center">
              <Spinner size="lg" />
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (isEmpty) {
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan} className="py-10">
            {emptyContent ?? (
              <p className="text-center text-slate-500">No records found.</p>
            )}
          </td>
        </tr>
      </tbody>
    );
  }

  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

/* Row: gets a hover highlight, and a pointer cursor if it is clickable */
export function Tr({ children, onClick, className = "" }) {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors hover:bg-slate-50 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </tr>
  );
}

const ALIGN = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/* Header cell */
export function Th({ children, align = "left", className = "" }) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
        ALIGN[align] ?? ALIGN.left
      } ${className}`}
    >
      {children}
    </th>
  );
}

/* Body cell */
export function Td({ children, align = "left", className = "" }) {
  return (
    <td
      className={`px-4 py-3 text-slate-700 ${ALIGN[align] ?? ALIGN.left} ${className}`}
    >
      {children}
    </td>
  );
}