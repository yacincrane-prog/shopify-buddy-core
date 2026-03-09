import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useOrders, useUpdateOrderStatus, useDeleteOrder } from "@/hooks/useOrders";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Phone } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { t, lang } = useLanguage();

  const statusLabels: Record<string, string> = {
    pending: t("orders.pending"),
    confirmed: t("orders.confirmed"),
    shipped: t("orders.shipped"),
    delivered: t("orders.delivered"),
    cancelled: t("orders.cancelled"),
  };

  const filtered = (orders ?? []).filter((o) => {
    const matchesSearch =
      !search ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search) ||
      o.product_title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => toast.success(t("orders.statusUpdated")),
      onError: () => toast.error(t("orders.updateFail")),
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteOrder.mutate(deleteId, {
      onSuccess: () => { toast.success(t("orders.deleted")); setDeleteId(null); },
      onError: () => toast.error(t("orders.deleteFail")),
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader title={t("orders.title")} description={t("orders.description")} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("orders.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.allStatuses")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">{t("common.loading")}</div>
      ) : !filtered.length ? (
        <div className="rounded-lg border border-dashed border-border p-8 sm:p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">{t("orders.noOrders")}</p>
        </div>
      ) : isMobile ? (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Card key={order.id} className="border-border">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{order.customer_name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {order.customer_phone}
                    </div>
                  </div>
                  <Badge className={`${statusColors[order.status]} border-0 text-xs`}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[60%]">{order.product_title} × {order.quantity}</span>
                  <span className="font-semibold">{Number(order.total_price).toLocaleString()} DA</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{order.wilaya} · {order.delivery_type === "home" ? t("orders.home") : t("orders.desk")}</span>
                  <span>{new Date(order.created_at).toLocaleDateString(lang === "ar" ? "ar-DZ" : "en")}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Select value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                    <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (<SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive shrink-0" onClick={() => setDeleteId(order.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">{t("orders.customer")}</TableHead>
                <TableHead className="min-w-[140px]">{t("orders.product")}</TableHead>
                <TableHead>{t("common.quantity")}</TableHead>
                <TableHead>{t("orders.amount")}</TableHead>
                <TableHead>{t("orders.wilaya")}</TableHead>
                <TableHead>{t("orders.delivery")}</TableHead>
                <TableHead className="min-w-[140px]">{t("common.status")}</TableHead>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{order.customer_name}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />{order.customer_phone}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{order.product_title}</TableCell>
                  <TableCell className="text-sm">{order.quantity}</TableCell>
                  <TableCell className="text-sm font-medium">{Number(order.total_price).toLocaleString()} DA</TableCell>
                  <TableCell className="text-sm">{order.wilaya}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {order.delivery_type === "home" ? t("orders.home") : t("orders.desk")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                      <SelectTrigger className="h-7 text-xs w-[130px]">
                        <Badge className={`${statusColors[order.status]} border-0 text-xs`}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (<SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString(lang === "ar" ? "ar-DZ" : "en")}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => setDeleteId(order.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("orders.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("orders.deleteWarning")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
