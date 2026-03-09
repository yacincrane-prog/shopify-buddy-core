import { useState, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAbandonedLeads, deleteAbandonedLead } from "@/lib/abandoned-leads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminAbandoned() {
  const queryClient = useQueryClient();
  const { data: leads, isLoading } = useQuery({ queryKey: ["abandoned-leads-admin"], queryFn: fetchAbandonedLeads });
  const deleteMutation = useMutation({
    mutationFn: deleteAbandonedLead,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["abandoned-leads-admin"] }); toast.success("تم حذف العميل المهجور"); },
  });

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filtered = useMemo(() => {
    let list = leads ?? [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((l: any) =>
        l.customer_phone?.toLowerCase().includes(q) ||
        l.customer_name?.toLowerCase().includes(q) ||
        l.product_title?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "newest") list = [...list].sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
    if (sortBy === "oldest") list = [...list].sort((a: any, b: any) => a.created_at.localeCompare(b.created_at));
    return list;
  }, [leads, search, sortBy]);

  const columns: DataTableColumn<any>[] = [
    {
      key: "date",
      header: "التاريخ",
      sortable: true,
      sortValue: (l) => l.created_at,
      render: (l) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {new Date(l.created_at).toLocaleDateString("ar-DZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
    {
      key: "product",
      header: "المنتج",
      sortable: true,
      sortValue: (l) => l.product_title,
      className: "max-w-[160px]",
      render: (l) => <span className="font-medium truncate block">{l.product_title}</span>,
    },
    {
      key: "name",
      header: "الاسم",
      render: (l) => l.customer_name || "—",
    },
    {
      key: "phone",
      header: "الهاتف",
      render: (l) => <span className="font-mono">{l.customer_phone}</span>,
    },
    {
      key: "wilaya",
      header: "الولاية",
      render: (l) => l.wilaya || "—",
    },
    {
      key: "commune",
      header: "البلدية",
      render: (l) => l.commune || "—",
    },
    {
      key: "status",
      header: "الحالة",
      render: (l) => (
        <Badge variant="outline" className="text-xs text-destructive border-destructive/30">{l.status === "abandoned" ? "متروك" : l.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-10",
      render: (l) => (
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteMutation.mutate(l.id)}>
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="العملاء المهجورون"
        description="عرض بيانات العملاء الذين لم يكملوا عملية الشراء"
        count={leads?.length}
        search={{ value: search, onChange: setSearch, placeholder: "بحث بالهاتف، الاسم، أو المنتج…" }}
        sort={{
          value: sortBy,
          onChange: setSortBy,
          options: [
            { label: "الأحدث أولاً", value: "newest" },
            { label: "الأقدم أولاً", value: "oldest" },
          ],
        }}
      />
      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(l) => l.id}
        isLoading={isLoading}
        emptyMessage={search ? "لا توجد نتائج مطابقة" : "لم يتم التقاط عملاء مهجورين بعد"}
        pageSize={15}
      />
    </div>
  );
}