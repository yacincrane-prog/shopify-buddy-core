import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  title?: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3 px-4">
      <SidebarTrigger className="shrink-0" />

      {title && <h2 className="text-sm font-semibold hidden sm:block">{title}</h2>}

      <div className="flex-1" />

      <div className="relative hidden md:block w-64">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search…"
          className="pl-9 h-9 bg-secondary/50 border-0 focus-visible:ring-1"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative shrink-0">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem>No new notifications</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
        A
      </div>
    </header>
  );
}
