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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["abandoned-leads-admin"] }); toast.success("Lead removed"); },
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
      header: "Date",
      sortable: true,
      sortValue: (l) => l.created_at,
      render: (l) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {new Date(l.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
    {
      key: "product",
      header: "Product",
      sortable: true,
      sortValue: (l) => l.product_title,
      className: "max-w-[160px]",
      render: (l) => <span className="font-medium truncate block">{l.product_title}</span>,
    },
    {
      key: "name",
      header: "Name",
      render: (l) => l.customer_name || "—",
    },
    {
      key: "phone",
      header: "Phone",
      render: (l) => <span className="font-mono">{l.customer_phone}</span>,
    },
    {
      key: "wilaya",
      header: "Wilaya",
      render: (l) => l.wilaya || "—",
    },
    {
      key: "commune",
      header: "Commune",
      render: (l) => l.commune || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (l) => (
        <Badge variant="outline" className="text-xs text-destructive border-destructive/30">{l.status}</Badge>
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
        title="Abandoned Leads"
        description="View captured abandoned checkout leads"
        count={leads?.length}
        search={{ value: search, onChange: setSearch, placeholder: "Search by phone, name, or product…" }}
        sort={{
          value: sortBy,
          onChange: setSortBy,
          options: [
            { label: "Newest First", value: "newest" },
            { label: "Oldest First", value: "oldest" },
          ],
        }}
      />
      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(l) => l.id}
        isLoading={isLoading}
        emptyMessage={search ? "No leads match your search" : "No abandoned leads captured yet"}
        pageSize={15}
      />
    </div>
  );
}
