import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number | Date;
  className?: string;
  align?: "left" | "right" | "center";
}

export function DataTable<T extends { _id: string }>({
  data,
  columns,
  search,
  onSearch,
  searchPlaceholder = "Search…",
  pageSize = 20,
  toolbar,
  emptyMessage = "Nothing here yet.",
  rowHref,
}: {
  data: T[];
  columns: Column<T>[];
  search?: string;
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  pageSize?: number;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  rowHref?: (row: T) => string | null;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    const out = [...data].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return out;
  }, [data, sortKey, sortDir, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages - 1);
  const pageRows = sorted.slice(current * pageSize, current * pageSize + pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="rounded-2xl border border-border-card bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-border-card p-4">
        {onSearch !== undefined && (
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={search ?? ""}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-border-card bg-background/50 py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-card text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-4 py-3 font-medium",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.className,
                  )}
                >
                  {c.sortValue ? (
                    <button
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1 hover:text-text-primary"
                    >
                      {c.header}
                      {sortKey === c.key ? (
                        sortDir === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-text-muted">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {pageRows.map((row) => {
              const href = rowHref?.(row) ?? null;
              return (
                <tr
                  key={row._id}
                  className={cn(
                    "border-b border-border-card/60 transition hover:bg-surface-hover",
                    href && "cursor-pointer",
                  )}
                  onClick={() => {
                    if (href) window.location.href = href;
                  }}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-4 py-3 align-middle text-text-primary",
                        c.align === "right" && "text-right",
                        c.align === "center" && "text-center",
                        c.className,
                      )}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-card p-3 text-xs text-text-secondary">
        <p>
          Showing{" "}
          <span className="font-medium text-text-primary">
            {sorted.length === 0 ? 0 : current * pageSize + 1}-
            {Math.min(sorted.length, (current + 1) * pageSize)}
          </span>{" "}
          of <span className="font-medium text-text-primary">{sorted.length}</span>
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(0, current - 1))}
            disabled={current === 0}
            className="rounded-md border border-border-card px-2 py-1 hover:bg-surface-hover disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-2 font-medium text-text-primary">
            {current + 1} / {pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pages - 1, current + 1))}
            disabled={current >= pages - 1}
            className="rounded-md border border-border-card px-2 py-1 hover:bg-surface-hover disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
