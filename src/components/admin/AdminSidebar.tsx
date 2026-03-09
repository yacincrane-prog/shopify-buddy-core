import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  Gift,
  TrendingUp,
  Tags,
  UserX,
  BarChart3,
  Settings,
  LogOut,
  Layers,
  Zap,
  Palette,
  CreditCard,
  Activity,
  Ticket,
  Truck,
  FileSpreadsheet,
  KeyRound,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Landing Pages", url: "/admin/landing-pages", icon: FileText },
];

const marketingNav = [
  { title: "Bundles", url: "/admin/bundles", icon: Gift },
  { title: "Upsells", url: "/admin/upsells", icon: TrendingUp },
  { title: "Post-Order Upsell", url: "/admin/post-upsell", icon: Zap },
  { title: "Discount Codes", url: "/admin/discount-codes", icon: Ticket },
  { title: "Qty Offers", url: "/admin/qty-offers", icon: Tags },
  { title: "Qty Discounts", url: "/admin/discounts", icon: Layers },
  { title: "Exit Intent", url: "/admin/exit-intent", icon: LogOut },
  { title: "Abandoned Leads", url: "/admin/abandoned", icon: UserX },
];

const systemNav = [
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Shipping", url: "/admin/shipping", icon: Truck },
  { title: "Tracking Pixels", url: "/admin/tracking-pixels", icon: Activity },
  { title: "Google Sheets", url: "/admin/google-sheets", icon: FileSpreadsheet },
  { title: "بيانات الدخول", url: "/admin/credentials", icon: KeyRound },
  { title: "Theme Editor", url: "/admin/theme", icon: Palette },
  { title: "Checkout Preview", url: "/admin/checkout-preview", icon: CreditCard },
  { title: "Page Builder", url: "/admin/page-builder", icon: Settings },
];

export function AdminSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const handleNavClick = () => {
    // Close mobile sidebar on navigation
    setOpenMobile(false);
  };

  const renderGroup = (label: string, items: typeof mainNav) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 px-3">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                tooltip={collapsed ? item.title : undefined}
              >
                <NavLink
                  to={item.url}
                  end={item.url === "/admin"}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-150 hover:text-foreground hover:bg-accent/10"
                  activeClassName="!bg-primary !text-primary-foreground shadow-sm"
                  onClick={handleNavClick}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-border">
      <SidebarHeader className="p-4 flex flex-row items-center justify-between lg:justify-start">
        <NavLink to="/" className="flex items-center gap-2.5 text-foreground hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-base font-bold tracking-tight">Store Admin</span>}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-2 gap-1">
        {renderGroup("Main", mainNav)}
        {renderGroup("Marketing", marketingNav)}
        {renderGroup("System", systemNav)}
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <p className="text-[10px] text-muted-foreground/50 text-center">v1.0 · Admin Panel</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
