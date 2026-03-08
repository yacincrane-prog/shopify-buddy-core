import { useProducts } from "@/hooks/useProducts";
import { Package, ShoppingCart, TrendingUp, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function AdminOverview() {
  const { data: products } = useProducts();

  const stats = [
    { label: "Products", value: products?.length ?? 0, icon: Package, href: "/admin/products", color: "text-blue-600 bg-blue-50" },
    { label: "Active", value: products?.filter((p) => p.is_active).length ?? 0, icon: TrendingUp, href: "/admin/products", color: "text-emerald-600 bg-emerald-50" },
    { label: "Orders", value: "—", icon: ShoppingCart, href: "/admin/orders", color: "text-amber-600 bg-amber-50" },
    { label: "Abandoned", value: "—", icon: UserX, href: "/admin/abandoned", color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back. Here's an overview of your store.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link to={s.href} key={s.label}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
