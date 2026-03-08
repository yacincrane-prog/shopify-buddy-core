import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useOrders, useUpdateOrderStatus, useDeleteOrder } from "@/hooks/useOrders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success("تم تحديث الحالة"),
        onError: () => toast.error("فشل التحديث"),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteOrder.mutate(deleteId, {
      onSuccess: () => {
        toast.success("تم حذف الطلب");
        setDeleteId(null);
      },
      onError: () => toast.error("فشل الحذف"),
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="الطلبات" description="عرض وإدارة طلبات العملاء" />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم، الهاتف، أو المنتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">جاري التحميل…</div>
      ) : !filtered.length ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">العميل</TableHead>
                <TableHead className="min-w-[140px]">المنتج</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الولاية</TableHead>
                <TableHead>التوصيل</TableHead>
                <TableHead className="min-w-[140px]">الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{order.customer_name}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {order.customer_phone}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{order.product_title}</TableCell>
                  <TableCell className="text-sm">{order.quantity}</TableCell>
                  <TableCell className="text-sm font-medium">{Number(order.total_price).toLocaleString()} DA</TableCell>
                  <TableCell className="text-sm">{order.wilaya}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {order.delivery_type === "home" ? "المنزل" : "المكتب"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(val) => handleStatusChange(order.id, val)}
                    >
                      <SelectTrigger className="h-7 text-xs w-[130px]">
                        <Badge className={`${statusColors[order.status]} border-0 text-xs`}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("ar-DZ")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive/70 hover:text-destructive"
                      onClick={() => setDeleteId(order.id)}
                    >
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
            <AlertDialogTitle>حذف الطلب؟</AlertDialogTitle>
            <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
