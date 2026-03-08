import { type ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterOption {
  label: string;
  value: string;
}

interface AdminPageHeaderProps {
  title: string;
  description: string;
  action?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    disabled?: boolean;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filters?: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
  }[];
  sort?: {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
  };
  count?: number;
  children?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  action,
  search,
  filters,
  sort,
  count,
  children,
}: AdminPageHeaderProps) {
  const hasToolbar = search || filters?.length || sort;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
            {count !== undefined && (
              <span className="inline-flex items-center justify-center h-5 sm:h-6 min-w-[20px] sm:min-w-[24px] rounded-full bg-muted px-1.5 sm:px-2 text-[10px] sm:text-xs font-medium text-muted-foreground">
                {count}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{description}</p>
        </div>
        {action && (
          <Button size="sm" onClick={action.onClick} disabled={action.disabled} className="shrink-0 text-xs sm:text-sm">
            {action.icon}
            <span className="hidden xs:inline">{action.label}</span>
            <span className="xs:hidden">{action.icon ? '' : action.label}</span>
          </Button>
        )}
      </div>

      {/* Toolbar row: search + filters + sort */}
      {hasToolbar && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {search && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={search.placeholder ?? "Search…"}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                className="pl-9 h-9 bg-secondary/50 border-border"
              />
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto">
            {filters?.map((filter, i) => (
              <Select key={i} value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger className="h-9 w-full sm:w-40 min-w-[120px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            {sort && (
              <Select value={sort.value} onValueChange={sort.onChange}>
                <SelectTrigger className="h-9 w-full sm:w-40 min-w-[120px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sort.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
