import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, TrendingUp, UserX, DollarSign, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

function useAbandonedCount() {
  return useQuery({
    queryKey: ["abandoned-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("abandoned_leads")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export default function AdminOverview() {
  const { data: products } = useProducts();
  const { data: orders } = useOrders();
  const { data: abandonedCount } = useAbandonedCount();

  const totalOrders = orders?.length ?? 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_price), 0) ?? 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending").length ?? 0;
  const deliveredOrders = orders?.filter((o) => o.status === "delivered").length ?? 0;

  const stats = [
    { label: "المنتجات", value: products?.length ?? 0, icon: Package, href: "/admin/products", color: "text-blue-600 bg-blue-50" },
    { label: "إجمالي الطلبات", value: totalOrders, icon: ShoppingCart, href: "/admin/orders", color: "text-amber-600 bg-amber-50" },
    { label: "قيد الانتظار", value: pendingOrders, icon: Truck, href: "/admin/orders", color: "text-purple-600 bg-purple-50" },
    { label: "تم التسليم", value: deliveredOrders, icon: TrendingUp, href: "/admin/orders", color: "text-emerald-600 bg-emerald-50" },
    { label: "الإيرادات", value: `${totalRevenue.toLocaleString()} DA`, icon: DollarSign, href: "/admin/orders", color: "text-green-600 bg-green-50" },
    { label: "متروكين", value: abandonedCount ?? 0, icon: UserX, href: "/admin/abandoned", color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">لوحة التحكم</h1>
        <p className="text-muted-foreground text-sm mt-1">مرحباً بك. إليك نظرة عامة على متجرك.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link to={s.href} key={s.label}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      {orders && orders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">آخر الطلبات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{o.product_title} × {o.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{Number(o.total_price).toLocaleString()} DA</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("ar-DZ")}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
