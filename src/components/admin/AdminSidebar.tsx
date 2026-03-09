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
  Store,
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
import { useLanguage } from "@/hooks/useLanguage";

export function AdminSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { t } = useLanguage();

  const mainNav = [
    { title: t("nav.dashboard"), url: "/admin", icon: LayoutDashboard },
    { title: t("nav.products"), url: "/admin/products", icon: Package },
    { title: t("nav.orders"), url: "/admin/orders", icon: ShoppingCart },
    { title: t("nav.landingPages"), url: "/admin/landing-pages", icon: FileText },
  ];

  const marketingNav = [
    { title: t("nav.bundles"), url: "/admin/bundles", icon: Gift },
    { title: t("nav.upsells"), url: "/admin/upsells", icon: TrendingUp },
    { title: t("nav.postUpsell"), url: "/admin/post-upsell", icon: Zap },
    { title: t("nav.discountCodes"), url: "/admin/discount-codes", icon: Ticket },
    { title: t("nav.qtyOffers"), url: "/admin/qty-offers", icon: Tags },
    { title: t("nav.qtyDiscounts"), url: "/admin/discounts", icon: Layers },
    { title: t("nav.exitIntent"), url: "/admin/exit-intent", icon: LogOut },
    { title: t("nav.abandoned"), url: "/admin/abandoned", icon: UserX },
  ];

  const systemNav = [
    { title: t("nav.analytics"), url: "/admin/analytics", icon: BarChart3 },
    { title: t("nav.shipping"), url: "/admin/shipping", icon: Truck },
    { title: t("nav.trackingPixels"), url: "/admin/tracking-pixels", icon: Activity },
    { title: t("nav.googleSheets"), url: "/admin/google-sheets", icon: FileSpreadsheet },
    { title: t("nav.credentials"), url: "/admin/credentials", icon: KeyRound },
    { title: t("nav.themeEditor"), url: "/admin/theme", icon: Palette },
    { title: t("nav.checkoutPreview"), url: "/admin/checkout-preview", icon: CreditCard },
    { title: t("nav.pageBuilder"), url: "/admin/page-builder", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const handleNavClick = () => setOpenMobile(false);

  const renderGroup = (label: string, items: typeof mainNav) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 px-3">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
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
          {!collapsed && <span className="text-base font-bold tracking-tight">{t("nav.controlPanel")}</span>}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-2 gap-1">
        {renderGroup(t("nav.main"), mainNav)}
        {renderGroup(t("nav.marketing"), marketingNav)}
        {renderGroup(t("nav.system"), systemNav)}
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <p className="text-[10px] text-muted-foreground/50 text-center">{t("nav.version")}</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
