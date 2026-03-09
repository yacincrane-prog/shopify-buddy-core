import { Bell, Search, LogOut, Languages } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

interface AdminHeaderProps {
  title?: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { session, signOut } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const email = session?.user?.email ?? "";
  const initial = email ? email[0].toUpperCase() : "A";

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3 px-4">
      <SidebarTrigger className="shrink-0" />

      {title && <h2 className="text-sm font-semibold hidden sm:block">{title}</h2>}

      <div className="flex-1" />

      <div className="relative hidden md:block w-64">
        <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("common.search")}
          className="ps-9 h-9 bg-secondary/50 border-0 focus-visible:ring-1"
        />
      </div>

      {/* Language toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 gap-1.5 text-xs font-medium"
        onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      >
        <Languages className="h-4 w-4" />
        <span className="hidden sm:inline">{t("lang.switch")}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative shrink-0">
            <Bell className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem>{t("nav.noNotifications")}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 hover:bg-primary/20 transition-colors">
            {initial}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">{email}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="text-destructive">
            <LogOut className="w-3.5 h-3.5 me-2" /> {t("auth.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
