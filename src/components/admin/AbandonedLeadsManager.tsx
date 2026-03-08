import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAbandonedLeads, deleteAbandonedLead } from "@/lib/abandoned-leads";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <UserX className="w-4 h-4 text-destructive" />
          Abandoned Leads
          {leads?.length ? (
            <Badge variant="secondary" className="text-xs">{leads.length}</Badge>
          ) : null}
        </h3>
      </div>

      {!leads?.length ? (
        <p className="text-sm text-muted-foreground py-4">No abandoned leads captured yet.</p>
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
                  {leads.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-xs font-medium max-w-[120px] truncate">
                        {lead.product_title}
                      </TableCell>
                      <TableCell className="text-xs">{lead.customer_name || "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{lead.customer_phone}</TableCell>
                      <TableCell className="text-xs">{lead.wilaya || "—"}</TableCell>
                      <TableCell className="text-xs">{lead.commune || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => deleteMutation.mutate(lead.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
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
