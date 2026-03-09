import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, TrendingUp, UserX, DollarSign, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

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
  const { t, lang } = useLanguage();

  const totalOrders = orders?.length ?? 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_price), 0) ?? 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending").length ?? 0;
  const deliveredOrders = orders?.filter((o) => o.status === "delivered").length ?? 0;

  const stats = [
    { label: t("overview.products"), value: products?.length ?? 0, icon: Package, href: "/admin/products", color: "text-blue-600 bg-blue-50" },
    { label: t("overview.totalOrders"), value: totalOrders, icon: ShoppingCart, href: "/admin/orders", color: "text-amber-600 bg-amber-50" },
    { label: t("overview.pending"), value: pendingOrders, icon: Truck, href: "/admin/orders", color: "text-purple-600 bg-purple-50" },
    { label: t("overview.delivered"), value: deliveredOrders, icon: TrendingUp, href: "/admin/orders", color: "text-emerald-600 bg-emerald-50" },
    { label: t("overview.revenue"), value: `${totalRevenue.toLocaleString()} DA`, icon: DollarSign, href: "/admin/orders", color: "text-green-600 bg-green-50" },
    { label: t("overview.abandoned"), value: abandonedCount ?? 0, icon: UserX, href: "/admin/abandoned", color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t("overview.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("overview.welcome")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((s) => (
          <Link to={s.href} key={s.label}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-base sm:text-xl font-bold truncate">{s.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {orders && orders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("overview.recentOrders")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{o.product_title} × {o.quantity}</p>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-sm font-semibold">{Number(o.total_price).toLocaleString()} DA</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString(lang === "ar" ? "ar-DZ" : "en")}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
