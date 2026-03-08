import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAbandonedLeads, deleteAbandonedLead } from "@/lib/abandoned-leads";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { Trash2, UserX } from "lucide-react";
import { toast } from "sonner";

export function AbandonedLeadsManager() {
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["abandoned-leads-admin"],
    queryFn: fetchAbandonedLeads,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAbandonedLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["abandoned-leads-admin"] });
      toast.success("Lead removed");
    },
  });

  const columns: DataTableColumn<any>[] = [
    { key: "date", header: "Date", sortable: true, sortValue: (l) => l.created_at, render: (l) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {new Date(l.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
      </span>
    )},
    { key: "product", header: "Product", className: "max-w-[120px]", render: (l) => <span className="font-medium truncate block">{l.product_title}</span> },
    { key: "name", header: "Name", render: (l) => l.customer_name || "—" },
    { key: "phone", header: "Phone", render: (l) => <span className="font-mono">{l.customer_phone}</span> },
    { key: "wilaya", header: "Wilaya", render: (l) => l.wilaya || "—" },
    { key: "commune", header: "Commune", render: (l) => l.commune || "—" },
    { key: "status", header: "Status", render: (l) => (
      <Badge variant="outline" className="text-xs text-destructive border-destructive/30">{l.status}</Badge>
    )},
    { key: "actions", header: "", headerClassName: "w-10", render: (l) => (
      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteMutation.mutate(l.id)}>
        <Trash2 className="w-3.5 h-3.5 text-destructive" />
      </Button>
    )},
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <UserX className="w-4 h-4 text-destructive" />
        Abandoned Leads
        {leads?.length ? (
          <Badge variant="secondary" className="text-xs">{leads.length}</Badge>
        ) : null}
      </h3>
      <DataTable
        data={leads ?? []}
        columns={columns}
        keyExtractor={(l) => l.id}
        isLoading={isLoading}
        emptyMessage="No abandoned leads captured yet."
        pageSize={10}
      />
    </div>
  );
}
