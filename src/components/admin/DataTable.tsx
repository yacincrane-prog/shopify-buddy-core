import { useState, useMemo, type ReactNode } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  /** Hide this column on mobile card view */
  hideOnMobile?: boolean;
  /** Label for mobile card view */
  mobileLabel?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (row: T) => string;
  pageSize?: number;
  emptyMessage?: string;
  isLoading?: boolean;
  /** Force card layout on mobile */
  mobileCards?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  pageSize = 10,
  emptyMessage = "No data found",
  isLoading,
  mobileCards = true,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const isMobile = useIsMobile();

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    const fn = col.sortValue;
    return [...data].sort((a, b) => {
      const va = fn(a);
      const vb = fn(b);
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paged = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);
  const from = sorted.length === 0 ? 0 : safePage * pageSize + 1;
  const to = Math.min((safePage + 1) * pageSize, sorted.length);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const renderPagination = () => {
    if (sorted.length <= pageSize) return null;
    return (
      <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3 bg-muted/30">
        <p className="text-xs text-muted-foreground">
          {from}–{to} of {sorted.length}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage === 0} onClick={() => setPage(0)}>
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {safePage + 1} / {totalPages}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  // Mobile card layout
  if (isMobile && mobileCards) {
    return (
      <div className="space-y-2">
        {paged.map((row) => (
          <Card key={keyExtractor(row)} className="border-border">
            <CardContent className="p-3 space-y-2">
              {columns.filter(c => !c.hideOnMobile).map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-2">
                  {col.mobileLabel && (
                    <span className="text-xs text-muted-foreground shrink-0">{col.mobileLabel}</span>
                  )}
                  <div className={`${col.mobileLabel ? 'text-right' : 'w-full'} text-sm`}>
                    {col.render(row)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        {renderPagination()}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Scrollable table area with sticky header */}
      <div className="overflow-auto max-h-[calc(100vh-320px)]">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
            <TableRow className="hover:bg-transparent border-b border-border">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`h-11 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap ${col.headerClassName ?? ""} ${col.sortable ? "cursor-pointer select-none" : ""}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      sortKey === col.key ? (
                        sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((row) => (
              <TableRow
                key={keyExtractor(row)}
                className="transition-colors hover:bg-muted/40 border-b border-border/50 last:border-0"
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={`py-3 px-4 text-sm ${col.className ?? ""}`}>
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {renderPagination()}
    </div>
  );
}
