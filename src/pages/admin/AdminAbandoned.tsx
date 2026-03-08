import { useState, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAbandonedLeads, deleteAbandonedLead } from "@/lib/abandoned-leads";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
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

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading…</div>
      ) : !filtered.length ? (
        <div className="text-center py-16 text-muted-foreground">
          {search ? "No leads match your search" : "No abandoned leads captured yet"}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Product</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Phone</TableHead>
                    <TableHead className="text-xs">Wilaya</TableHead>
                    <TableHead className="text-xs">Commune</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell className="text-xs font-medium max-w-[120px] truncate">{lead.product_title}</TableCell>
                      <TableCell className="text-xs">{lead.customer_name || "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{lead.customer_phone}</TableCell>
                      <TableCell className="text-xs">{lead.wilaya || "—"}</TableCell>
                      <TableCell className="text-xs">{lead.commune || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs text-destructive border-destructive/30">{lead.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteMutation.mutate(lead.id)}><Trash2 className="w-3 h-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
